import "dotenv/config";
import { PrismaClient, type FeedbackChannel, type FeedbackStatus } from "../generated/prisma/client.js";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const adapter = new PrismaLibSql({
  url: process.env["DATABASE_URL"]!,
});

const prisma = new PrismaClient({ adapter });

type FeedbackSeed = {
  customerName: string;
  rating: number;
  comment: string | null;
  channel: FeedbackChannel;
  status: FeedbackStatus;
};

const feedbacks: FeedbackSeed[] = [
  { customerName: "Ana Ribeiro", rating: 5, comment: "Atendimento excelente, comida ótima!", channel: "GOOGLE", status: "CONCLUIDO" },
  { customerName: "Bruno Costa", rating: 2, comment: "Demorou muito e o prato veio errado.", channel: "IFOOD", status: "CONCLUIDO" },
  { customerName: "Carla Dias", rating: 4, comment: "Gostei bastante, voltarei.", channel: "GOOGLE", status: "EM_ANALISE" },
  { customerName: "Diego Alves", rating: 1, comment: "Comida fria e atendimento ruim.", channel: "PESQUISA", status: "EM_ANALISE" },
  { customerName: "Elisa Farias", rating: 5, comment: null, channel: "GOOGLE", status: "NOVO" },
  { customerName: "Felipe Souza", rating: 3, comment: "Mediano, esperava mais.", channel: "IFOOD", status: "NOVO" },
  { customerName: "Gabriela Lima", rating: 2, comment: "Atendimento demorado no salão.", channel: "PESQUISA", status: "EM_ANALISE" },
  { customerName: "Hugo Martins", rating: 4, comment: "Bom custo-benefício.", channel: "GOOGLE", status: "NOVO" },
  { customerName: "Isabela Rocha", rating: 5, comment: "Melhor restaurante da região!", channel: "IFOOD", status: "CONCLUIDO" },
  { customerName: "João Pedro", rating: 1, comment: "Não recomendo, péssima experiência.", channel: "GOOGLE", status: "NOVO" },
  { customerName: "Karina Souza", rating: 3, comment: null, channel: "PESQUISA", status: "NOVO" },
  { customerName: "Lucas Nunes", rating: 4, comment: "Ambiente agradável, comida boa.", channel: "IFOOD", status: "NOVO" },
  { customerName: "Mariana Reis", rating: 2, comment: "Pedido veio incompleto.", channel: "GOOGLE", status: "NOVO" },
  { customerName: "Nathan Prado", rating: 5, comment: "Sempre excelente!", channel: "GOOGLE", status: "EM_ANALISE" },
  { customerName: "Olívia Castro", rating: 1, comment: "Muito caro para a qualidade oferecida.", channel: "PESQUISA", status: "NOVO" },
];

const notesByCustomerName: Record<string, string[]> = {
  "Ana Ribeiro": ["Cliente elogiou o atendimento, respondemos agradecendo publicamente."],
  "Bruno Costa": [
    "Entramos em contato para entender o que houve com o pedido.",
    "Cliente aceitou desconto na próxima compra como forma de compensação.",
  ],
  "Diego Alves": ["Contato feito por telefone, cliente relatou detalhes do ocorrido."],
  "Gabriela Lima": ["Equipe do salão foi orientada sobre o tempo de espera relatado."],
  "Isabela Rocha": ["Agradecemos o feedback positivo e convidamos para nova visita."],
};

async function main() {
  await prisma.feedbackNote.deleteMany();
  await prisma.feedback.deleteMany();

  for (const data of feedbacks) {
    const created = await prisma.feedback.create({ data });

    const notes = notesByCustomerName[data.customerName];

    if (notes) {
      for (const description of notes) {
        await prisma.feedbackNote.create({
          data: {
            feedbackId: created.id,
            description,
          },
        });
      }
    }
  }

  console.log(`Seed concluído: ${feedbacks.length} feedbacks criados.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });