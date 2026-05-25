import dotenv from 'dotenv'
dotenv.config()
import jwt from 'jsonwebtoken'
import prisma from './src/lib/prisma'
import fetch from 'node-fetch'

async function test() {
  try {
    const user = await prisma.user.findFirst({ where: { role: 'STUDENT' }})
    if (!user) throw new Error("No student")

    const item = await prisma.menuItem.findFirst({ where: { isAvailable: true }})
    if (!item) throw new Error("No available menu item")

    const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET as string, { expiresIn: '1d' })

    const res = await fetch('http://localhost:4000/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        orderType: 'INSTANT',
        items: [{
          menuItemId: item.id,
          quantity: 1,
          customization: ''
        }]
      })
    })
    
    console.log('Status:', res.status)
    const json = await res.json()
    console.log('Response:', json)
    
  } catch (err) {
    console.error('Test script Error:', err)
  }
}
test()
