import { PrismaClient } from '@prisma/client'

let prisma: PrismaClient

export const initPrisma = async () => {
  if (!prisma) {
    prisma = new PrismaClient()
    try {
      await prisma.$connect()
      console.log('Database connected successfully')
    } catch (error) {
      console.error('Database connection error:', error)
    }
  }
  return prisma
}

export const getPrisma = () => {
  if (!prisma) {
    prisma = new PrismaClient()
  }
  return prisma
}
