import dotenv from 'dotenv'
dotenv.config()
import prisma from './src/lib/prisma'

async function test() {
  try {
    const order = await prisma.order.findFirst({ orderBy: { createdAt: 'desc' } })
    if (!order) throw new Error("No order found")

    const req: any = {
      userId: order.userId,
      body: {
        orderId: order.id
      }
    }
    const res: any = {
      status: (code: number) => {
        console.log('Status:', code)
        return res
      },
      json: (data: any) => {
        console.log('JSON:', data)
        return res
      }
    }

    const paymentController = require('./src/controllers/payment.controller')
    await paymentController.createPayment(req, res)
    
  } catch (err) {
    console.error('Test script Error:', err)
  }
}
test()
