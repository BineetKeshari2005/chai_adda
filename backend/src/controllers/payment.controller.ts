import { Request, Response } from 'express'
import Razorpay from 'razorpay'
import crypto from 'crypto'
import prisma from '../lib/prisma'

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!
})

// POST /api/payments/create — creates razorpay order
export const createPayment = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.body
    const userId = (req as any).userId

    if (!orderId) {
      return res.status(400).json({ error: 'Order ID is required' })
    }

    // fetch the order
    const order = await prisma.order.findUnique({
      where: { id: orderId }
    })

    if (!order) {
      return res.status(404).json({ error: 'Order not found' })
    }

    // make sure this order belongs to the student
    if (order.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized' })
    }

    // make sure order is not already paid
    const existingPayment = await prisma.payment.findUnique({
      where: { orderId }
    })

    if (existingPayment && existingPayment.status === 'PAID') {
      return res.status(400).json({ error: 'Order already paid' })
    }

    // create razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(order.total * 100), // razorpay needs amount in paise
      currency: 'INR',
      receipt: `rcpt_${orderId.substring(0, 34)}`,
      notes: {
        orderId,
        userId
      }
    })

    // save payment record in our database
    await prisma.payment.upsert({
      where: { orderId },
      create: {
        orderId,
        amount: order.total,
        upiRef: razorpayOrder.id,
        status: 'PENDING'
      },
      update: {
        upiRef: razorpayOrder.id,
        status: 'PENDING'
      }
    })

    return res.status(200).json({
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID
    })
  } catch (error) {
    console.log('CREATE PAYMENT ERROR:', error)
    return res.status(500).json({ error: 'Something went wrong' })
  }
}

// POST /api/payments/verify — verifies razorpay signature after payment
export const verifyPayment = async (req: Request, res: Response) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId
    } = req.body

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: 'Missing payment details' })
    }

    // verify signature — this confirms payment is genuine
    const body = razorpay_order_id + '|' + razorpay_payment_id
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest('hex')

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ error: 'Invalid payment signature' })
    }

    // update payment status to PAID
    await prisma.payment.update({
      where: { orderId },
      data: {
        status: 'PAID',
        upiRef: razorpay_payment_id,
        verifiedAt: new Date()
      }
    })

    // update order status to CONFIRMED
    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status: 'CONFIRMED' }
    })

    return res.status(200).json({
      success: true,
      message: `Payment successful! Your token number is #${order.tokenNumber}`,
      tokenNumber: order.tokenNumber,
      orderId: order.id
    })
  } catch (error) {
    console.log('VERIFY PAYMENT ERROR:', error)
    return res.status(500).json({ error: 'Something went wrong' })
  }
}

// GET /api/payments/:orderId — get payment status
export const getPaymentStatus = async (req: Request, res: Response) => {
  try {
    const orderId = req.params.orderId as string
    const userId = (req as any).userId

    const order = await prisma.order.findUnique({
      where: { id: orderId }
    })

    if (!order) {
      return res.status(404).json({ error: 'Order not found' })
    }

    if (order.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized' })
    }

    const payment = await prisma.payment.findUnique({
      where: { orderId }
    })

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' })
    }

    return res.status(200).json({ payment })
  } catch (error) {
    return res.status(500).json({ error: 'Something went wrong' })
  }
}