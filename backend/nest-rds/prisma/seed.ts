import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

const main = async () => {
  for (let i = 0; i < 3; i += 1) {
    await prisma.cart.create({
      data: {
        user_id: randomUUID(),
        status: 'OPEN',
        items: {
          create: [
            {
              count: Math.round(Math.random() * 5 + 1),
              product_id: randomUUID(),
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
