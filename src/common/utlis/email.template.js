export const emailTemplate = (otp) => {
  return `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Confirm your email</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f4f5f7;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f4f5f7;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:480px;background-color:#ffffff;border-radius:12px;overflow:hidden;">
  
            <!-- Header -->
            <tr>
              <td align="center" style="background-color:#0e7c66;padding:24px;">
                <h1 style="margin:0;color:#ffffff;font-size:26px;letter-spacing:1px;">Saraha</h1>
                <p style="margin:4px 0 0;color:#cdeee6;font-size:13px;">Honest messages, anonymously</p>
              </td>
            </tr>
  
            <!-- Body -->
            <tr>
              <td style="padding:32px 28px;color:#333333;">
                <h2 style="margin:0 0 12px;font-size:20px;color:#222222;">Confirm your email</h2>
                <p style="margin:0 0 8px;font-size:15px;line-height:1.6;">Hi there,</p>
                <p style="margin:0 0 24px;font-size:15px;line-height:1.6;">Use the code below to confirm your email address.</p>
  
                <!-- OTP box -->
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td align="center">
                      <div style="display:inline-block;padding:16px 28px;background-color:#eef8f5;border:2px dashed #0e7c66;border-radius:10px;font-size:32px;font-weight:bold;letter-spacing:10px;color:#0e7c66;font-family:'Courier New',monospace;">
                        ${otp}
                      </div>
                    </td>
                  </tr>
                </table>
  
                <p style="margin:24px 0 0;font-size:14px;line-height:1.6;color:#555555;">
                  This code expires in <strong>20 minutes</strong>. Do not share it with anyone.
                </p>
                <p style="margin:12px 0 0;font-size:14px;line-height:1.6;color:#555555;">
                  If you didn't request this, you can safely ignore this email.
                </p>
              </td>
            </tr>
  
            <!-- Footer -->
            <tr>
              <td align="center" style="background-color:#fafafa;padding:16px;border-top:1px solid #eeeeee;">
                <p style="margin:0;font-size:12px;color:#999999;">&copy; 2026 Saraha App. All rights reserved.</p>
              </td>
            </tr>
  
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>`;
};
