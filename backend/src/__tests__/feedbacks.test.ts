import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { app } from "../app.js";
import { prisma } from "../lib/prisma.js";

describe("Regra de feedback crítico", () => {
  let criticoSemNotaId: number;
  let naoCriticoId: number;

  beforeAll(async () => {
    const critico = await prisma.feedback.create({
      data: { customerName: "Teste Crítico", rating: 1, comment: "teste", channel: "GOOGLE" },
    });
    criticoSemNotaId = critico.id;

    const naoCritico = await prisma.feedback.create({
      data: { customerName: "Teste Não Crítico", rating: 5, comment: "teste", channel: "GOOGLE" },
    });
    naoCriticoId = naoCritico.id;
  });

  afterAll(async () => {
    await prisma.feedbackNote.deleteMany({ where: { feedbackId: criticoSemNotaId } });
    await prisma.feedback.deleteMany({ where: { id: { in: [criticoSemNotaId, naoCriticoId] } } });
  });

  it("bloqueia concluir feedback crítico sem anotação", async () => {
    const response = await request(app)
      .patch(`/api/feedbacks/${criticoSemNotaId}/status`)
      .send({ status: "CONCLUIDO" });

    expect(response.status).toBe(422);
    expect(response.body.error).toMatch(/crítico/i);
  });

  it("permite concluir feedback crítico após adicionar anotação", async () => {
    await request(app)
      .post(`/api/feedbacks/${criticoSemNotaId}/notes`)
      .send({ description: "Entramos em contato com o cliente." });

    const response = await request(app)
      .patch(`/api/feedbacks/${criticoSemNotaId}/status`)
      .send({ status: "CONCLUIDO" });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("CONCLUIDO");
  });

  it("permite concluir feedback não crítico sem anotação", async () => {
    const response = await request(app)
      .patch(`/api/feedbacks/${naoCriticoId}/status`)
      .send({ status: "CONCLUIDO" });

    expect(response.status).toBe(200);
  });

  it("bloqueia anotação vazia ou só com espaços", async () => {
    const response = await request(app)
      .post(`/api/feedbacks/${naoCriticoId}/notes`)
      .send({ description: "   " });

    expect(response.status).toBe(400);
  });

  it("retorna 404 para feedback inexistente", async () => {
    const response = await request(app)
      .patch("/api/feedbacks/999999/status")
      .send({ status: "CONCLUIDO" });

    expect(response.status).toBe(404);
  });
});