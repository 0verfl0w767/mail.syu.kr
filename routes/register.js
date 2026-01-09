require("dotenv").config();
const express = require("express");
const path = require("path");
const mariadb = require("mariadb");
const { exec } = require("child_process");
const router = express.Router();

const pool = mariadb.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

router.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../views/register.html"));
});

router.post("/", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password)
    return res.send(
      `<script>alert("아이디와 비밀번호가 필요합니다."); history.back();</script>`
    );

  if (!/^[a-z0-9._-]{8,20}$/.test(username))
    return res.send(
      `<script>alert("아이디 형식이 잘못되었습니다."); history.back();</script>`
    );

  try {
    const conn = await pool.getConnection();

    const existingUser = await conn.query(
      "SELECT 1 FROM mail_users WHERE username = ?",
      [username]
    );
    if (existingUser.length > 0) {
      conn.release();
      return res.send(
        `<script>alert("이미 존재하는 아이디입니다."); history.back();</script>`
      );
    }

    const hash = require("child_process")
      .execSync(`openssl passwd -6 "${password}"`)
      .toString()
      .trim();

    await conn.query(
      "INSERT INTO mail_users (username, password) VALUES (?, ?)",
      [username, hash]
    );
    conn.release();

    const domain = "syu.kr";
    const maildir = `/var/mail/vhosts/${domain}/${username}`;
    exec(`mkdir -p ${maildir} && chown -R vmail:vmail ${maildir}`, (err) => {
      if (err) console.error("Maildir 생성 실패:", err);
    });

    res.send(`
      <script>
        alert("회원가입 성공! 잠시 후 페이지가 이동됩니다.");
        window.location.href = "/";
      </script>
    `);
  } catch (err) {
    console.error(err);
    res.send(`<script>alert("서버 오류"); history.back();</script>`);
  }
});

module.exports = router;
