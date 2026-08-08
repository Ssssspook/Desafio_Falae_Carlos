import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const adapter = new PrismaLibSql({
  url: process.env["DATABASE_URL"]!,
});

const prisma = new PrismaClient({ adapter });

const channels = ["GOOGLE", "IFOOD", "PESQUISA"] as const;

const samples = [
  { customerName: "Ana Ribeiro", rating: 5, comment: "Atendimento excelente, comida ótima!", channel: "GOOGLE" },
  { customerName: "Bruno Costa", rating: 2, comment: "Demorou muito e o prato veio errado.", channel: "IFOOD" },
  { customerName: "Carla Dias", rating: 4, comment: "Gostei bastante, voltarei.", channel: "GOOGLE" },
  { customerName: "Diego Alves", rating: 1, comment: "Comida fria e atendimento ruim.", channel: "PESQUISA" },
  { customerName: "Elisa Farias", rating: 5, comment: "", channel: "GOOGLE" },
  { customerName: "Felipe Souza", rating: 3, comment: "Mediano, esperava mais.", channel: "IFOOD" },
  { customerName: "Gabriela Lima", rating: 2, comment: "Atendimento demorado no salão.", channel: "PESQUISA" },
  { customerName: "Hugo Martins", rating: 4, comment: "Bom custo-benefício.", channel: "GOOGLE" },
  { customerName: "Isabela Rocha", rating: 5, comment: "Melhor restaurante da região!", channel: "IFOOD" },
  { customerName: "João Pedro", rating: 1, comment: "Não recomendo, péssima experiência.", channel: "GOOGLE" },
  { customerName: "Karina Souza", rating: 3, comment: "", channel: "PESQUISA" },
  { customerName: "Lucas Nunes", rating: 4, comment: "Ambiente agradável, comida boa.", channel: "IFOOD" },
  { customerName: "Mariana Reis", rating: 2, comment: "Pedido veio incompleto.", channel: "GOOGLE" },
  { customerName: "Nathan Prado", rating: 5, comment: "Sempre excelente!", channel: "GOOGLE" },
  { customerName: "Olívia Castro", rating: 1, comment: "Muito caro para a qualidade oferecida.", channel: "PESQUISA" },
];

async function main() {
  await prisma.feedbackNote.deleteMany();
  await prisma.feedback.deleteMany();

  for (const sample of samples) {
    await prisma.feedback.create({ data: sample });
  }

  console.log(`Seed concluído: ${samples.length} feedbacks criados.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });