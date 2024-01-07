import { PrismaClient } from '@prisma/client';
// import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

const main = async () => {
  const testUser = await prisma.user.create({
    data: {
      id: 'Test user 1',
      name: 'Test user 1',
      email: 'example@email.com',
      password: '***',
    },
  });

  const products: string[] = Array(10).fill(null);
  for (let i = 0; i < products.length; i += 1) {
    const { id } = await prisma.product.create({
      data: {
        title: 'Product' + (i + 1),
        description: 'Description' + i + 1,
        price: Math.round(Math.random() * 50 + 10),
      },
    });
    products[i] = id;
  }
  for (let i = 0; i < 3; i += 1) {
    await prisma.cart.create({
      data: {
        user_id: testUser.id,
        // status: 'OPEN',
        items: {
          create: [
            {
              count: Math.round(Math.random() * 5 + 1),
              product_id: products[i * 2],
            },
          ],
        },
      },
    });
  }
};

main()
  .then(async () => {
    console.log(
      await prisma.cart.findMany({
        include: { items: true },
      }),
    );
    await prisma.$disconnect();
  })
  .catch(async (err) => {
    console.log(err);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
