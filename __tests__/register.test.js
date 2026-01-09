require("dotenv").config();
const request = require("supertest");
const express = require("express");
const registerRouter = require("../routes/register");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/", registerRouter);

describe("POST / register endpoint", () => {
  it("should fail when username or password missing", async () => {
    const res = await request(app)
      .post("/")
      .send({ username: "", password: "" });
    expect(res.text).toMatch(/아이디와 비밀번호가 필요합니다/);
  });

  it("should fail for invalid username format", async () => {
    const res = await request(app)
      .post("/")
      .send({ username: "test!", password: "password123" });
    expect(res.text).toMatch(/아이디 형식이 잘못되었습니다/);
  });
});
