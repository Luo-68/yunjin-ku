const nodemailer = require('nodemailer');

// 多邮箱配置支持
const emailAccounts = [];

// 从环境变量加载多个邮箱配置
function loadEmailAccounts() {
  // 支持两种配置方式：
  // 1. 单邮箱配置（兼容旧版）
  if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    emailAccounts.push({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT) || 587,
      secure: process.env.EMAIL_PORT === '465',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      name: process.env.EMAIL_USER
    });
  }

  // 2. 多邮箱配置（新增）
  for (let i = 1; i <= 10; i++) {
    const host = process.env[`EMAIL_${i}_HOST`];
    const user = process.env[`EMAIL_${i}_USER`];
    const pass = process.env[`EMAIL_${i}_PASS`];
    const port = process.env[`EMAIL_${i}_PORT`];

    if (host && user && pass) {
      emailAccounts.push({
        host: host,
        port: port ? parseInt(port) : 587,
        secure: port === '465',
        auth: {
          user: user,
          pass: pass
        },
        name: user
      });
    }
  }

  if (emailAccounts.length === 0) {
    console.warn('⚠️  未配置任何邮箱账号，邮件功能将无法使用');
  } else {
    console.log(`✅ 已加载 ${emailAccounts.length} 个邮箱账号配置`);
  }
}

// 初始化加载邮箱配置
loadEmailAccounts();

// 获取当前可用的邮箱账号（轮换使用）
let currentAccountIndex = 0;
function getCurrentAccount() {
  if (emailAccounts.length === 0) {
    throw new Error('未配置邮箱账号');
  }
  return emailAccounts[currentAccountIndex];
}

// 切换到下一个邮箱账号
function rotateAccount() {
  if (emailAccounts.length > 1) {
    currentAccountIndex = (currentAccountIndex + 1) % emailAccounts.length;
  }
}

// 创建邮件传输器
function createTransporter(account) {
  return nodemailer.createTransport({
    host: account.host,
    port: account.port,
    secure: account.secure,
    auth: {
      user: account.auth.user,
      pass: account.auth.pass
    }
  });
}

// 发送验证邮件（支持多邮箱轮换和重试）
const sendVerificationEmail = async (email, username, token) => {
  if (emailAccounts.length === 0) {
    throw new Error('未配置邮箱账号，无法发送邮件');
  }

  const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${token}`;

  const maxRetries = emailAccounts.length; // 最多重试次数等于邮箱数量
  let lastError = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const account = getCurrentAccount();
      const transporter = createTransporter(account);

      const mailOptions = {
        from: `"云矜ku" <${account.auth.user}>`,
        to: email,
        subject: '验证您的云矜ku账户',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <style>
              body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .button { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
              .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>欢迎加入云矜ku</h1>
              </div>
              <div class="content">
                <p>亲爱的 <strong>${username}</strong>，</p>
                <p>感谢您注册云矜ku！请点击下面的按钮验证您的邮箱地址：</p>
                <a href="${verificationUrl}" class="button">验证邮箱</a>
                <p>如果按钮无法点击，请复制以下链接到浏览器：</p>
                <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
                <p style="color: #999; font-size: 12px; margin-top: 20px;">此链接将在24小时后过期。</p>
              </div>
              <div class="footer">
                <p>如果您没有注册云矜ku账户，请忽略此邮件。</p>
              </div>
            </div>
          </body>
          </html>
        `
      };

      await transporter.sendMail(mailOptions);
      console.log(`✅ 验证邮件已发送至: ${email} (使用发件人: ${account.auth.user})`);
      return; // 发送成功，退出重试循环

    } catch (error) {
      lastError = error;
      console.error(`❌ 使用邮箱 ${getCurrentAccount().auth.user} 发送失败 (尝试 ${attempt + 1}/${maxRetries}):`, error.message);

      // 切换到下一个邮箱账号
      rotateAccount();

      // 如果还有其他邮箱可以尝试，继续重试
      if (attempt < maxRetries - 1) {
        console.log(`🔄 切换到邮箱: ${getCurrentAccount().auth.user}`);
        await new Promise(resolve => setTimeout(resolve, 1000)); // 等待1秒后重试
      }
    }
  }

  // 所有邮箱都尝试失败
  console.error('❌ 所有邮箱账号均发送失败');
  throw lastError;
};

// 发送验证码邮件（新增）
const sendVerificationCodeEmail = async (email, username, verificationCode) => {
  if (emailAccounts.length === 0) {
    throw new Error('未配置邮箱账号，无法发送邮件');
  }

  const maxRetries = emailAccounts.length;
  let lastError = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const account = getCurrentAccount();
      const transporter = createTransporter(account);

      const mailOptions = {
        from: `"云矜ku" <${account.auth.user}>`,
        to: email,
        subject: '【云矜ku】您的邮箱验证码',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <style>
              body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .code-box { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; font-size: 32px; font-weight: bold; text-align: center; border-radius: 10px; margin: 20px 0; letter-spacing: 8px; }
              .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>邮箱验证</h1>
              </div>
              <div class="content">
                <p>亲爱的 <strong>${username}</strong>，</p>
                <p>感谢您注册云矜ku！您的邮箱验证码是：</p>
                <div class="code-box">${verificationCode}</div>
                <p>验证码有效期为 <strong>10分钟</strong>，请尽快输入验证码完成验证。</p>
                <p style="color: #999; font-size: 12px; margin-top: 20px;">
                  如果您没有注册云矜ku账户，请忽略此邮件。
                </p>
              </div>
              <div class="footer">
                <p>此邮件由系统自动发送，请勿回复。</p>
              </div>
            </div>
          </body>
          </html>
        `
      };

      await transporter.sendMail(mailOptions);
      console.log(`✅ 验证码邮件已发送至: ${email} (验证码: ${verificationCode}, 使用发件人: ${account.auth.user})`);
      return;

    } catch (error) {
      lastError = error;
      console.error(`❌ 使用邮箱 ${getCurrentAccount().auth.user} 发送失败 (尝试 ${attempt + 1}/${maxRetries}):`, error.message);

      rotateAccount();

      if (attempt < maxRetries - 1) {
        console.log(`🔄 切换到邮箱: ${getCurrentAccount().auth.user}`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }

  console.error('❌ 所有邮箱账号均发送失败');
  throw lastError;
};

// 发送重置密码邮件（支持多邮箱轮换和重试）
const sendResetPasswordEmail = async (email, username, token) => {
  if (emailAccounts.length === 0) {
    throw new Error('未配置邮箱账号，无法发送邮件');
  }

  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${token}`;

  const maxRetries = emailAccounts.length; // 最多重试次数等于邮箱数量
  let lastError = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const account = getCurrentAccount();
      const transporter = createTransporter(account);

      const mailOptions = {
        from: `"云矜ku" <${account.auth.user}>`,
        to: email,
        subject: '重置您的云矜ku密码',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <style>
              body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .button { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
              .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>重置密码</h1>
              </div>
              <div class="content">
                <p>亲爱的 <strong>${username}</strong>，</p>
                <p>我们收到了您的密码重置请求。请点击下面的按钮重置您的密码：</p>
                <a href="${resetUrl}" class="button">重置密码</a>
                <p>如果按钮无法点击，请复制以下链接到浏览器：</p>
                <p style="word-break: break-all; color: #666;">${resetUrl}</p>
                <p style="color: #999; font-size: 12px; margin-top: 20px;">此链接将在1小时后过期。</p>
              </div>
              <div class="footer">
                <p>如果您没有请求重置密码，请忽略此邮件。</p>
              </div>
            </div>
          </body>
          </html>
        `
      };

      await transporter.sendMail(mailOptions);
      console.log(`✅ 重置密码邮件已发送至: ${email} (使用发件人: ${account.auth.user})`);
      return; // 发送成功，退出重试循环

    } catch (error) {
      lastError = error;
      console.error(`❌ 使用邮箱 ${getCurrentAccount().auth.user} 发送失败 (尝试 ${attempt + 1}/${maxRetries}):`, error.message);

      // 切换到下一个邮箱账号
      rotateAccount();

      // 如果还有其他邮箱可以尝试，继续重试
      if (attempt < maxRetries - 1) {
        console.log(`🔄 切换到邮箱: ${getCurrentAccount().auth.user}`);
        await new Promise(resolve => setTimeout(resolve, 1000)); // 等待1秒后重试
      }
    }
  }

  // 所有邮箱都尝试失败
  console.error('❌ 所有邮箱账号均发送失败');
  throw lastError;
};

module.exports = {
  sendVerificationEmail,
  sendVerificationCodeEmail,
  sendResetPasswordEmail
};