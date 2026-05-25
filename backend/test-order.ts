import dotenv from 'dotenv'
dotenv.config()
import prisma from './src/lib/prisma'

async function test() {
  try {
    // 1. Get an item
    const item = await prisma.menuItem.findFirst()
    if (!item) throw new Error("No menu item")
    // 2. Get a user
    const user = await prisma.user.findFirst({ where: { role: 'STUDENT' }})
    if (!user) throw new Error("No student")

    // 3. Make mock req res
    const req: any = {
      userId: user.id,
      body: {
        orderType: 'INSTANT',
        items: [{
          menuItemId: item.id,
          quantity: 1
        }]
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

    const orderController = require('./src/controllers/order.controller')
    await orderController.placeOrder(req, res)
    
  } catch (err) {
    console.error('Test script Error:', err)
  }
}
test()
