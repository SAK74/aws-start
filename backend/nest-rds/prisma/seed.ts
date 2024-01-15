import { PrismaClient } from '@prisma/client';

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
  console.log('User: ', testUser);

  await prisma.cart.create({
    data: {
      user_id: testUser.id,
    },
  });
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
