// scripts/register-admin-images.ts
const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

async function getOrCreateAdminUser() {
  const adminEmail = 'admin@example.com'
  
  let admin = await prisma.user.findUnique({
    where: { email: adminEmail }
  })

  if (!admin) {
    admin = await prisma.user.create({
      data: {
        email: adminEmail,
        name: 'Admin',
        birthdate: new Date(), 
      }
    })
  }

  return admin.id
}

async function registerAdminImages() {
  try {
    const adminUserId = await getOrCreateAdminUser()
    
    const imagesPath = '/images/admin'
    // パスを修正: プロジェクトルートからの相対パスに変更
    const adminImagesDir = path.join(process.cwd(), '..', 'vertex/admin_images')
    const files = fs.readdirSync(adminImagesDir)
    
    console.log(`Found ${files.length} images to register`)

    for (const file of files) {
      if (file.match(/\.(jpg|jpeg|png|gif)$/i)) {
        const gcsPath = `${imagesPath}/${file}`
        const title = path.basename(file, path.extname(file))
        
        await prisma.pin.create({
          data: {
            title,
            description: `Admin uploaded image: ${title}`,
            imageUrl: gcsPath,
            userId: adminUserId,
          }
        })
        
        console.log(`Registered: ${gcsPath}`)
      }
    }

    console.log('All images have been registered successfully')
  } catch (error) {
    console.error('Error registering images:', error)
  } finally {
    await prisma.$disconnect()
  }
}

registerAdminImages()
