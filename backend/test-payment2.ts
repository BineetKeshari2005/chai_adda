import dotenv from 'dotenv'
dotenv.config()
import prisma from './src/lib/prisma'

async function test() {
  try {
    const user = await prisma.user.findFirst({ where: { role: 'STUDENT' }})
    if (!user) throw new Error("No student")

    const order = await prisma.order.create({
      data: {
        userId: user.id,
        tokenNumber: 9999,
        total: 100,
        orderType: 'INSTANT',
        status: 'PENDING',
      }
    })

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
