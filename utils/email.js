var nodemailer=require("nodemailer");
var pug=require("pug");
var htmlToText=require("html-to-text");

module.exports=class Email
{
    constructor(user,url)
    {
        this.to=user.email;
        this.firstName=user.name.split(' ')[0];
        this.url=url;
        this.from=`Kush Mazumdar <${process.env.EMAIL_FROM}>`;
    }
    newTransport()
    {
        if(process.env.NODE_ENV==="production")
        {
            return nodemailer.createTransport(
                {
                    service:"gmail",
                    host:"smtp.gmail.com",
                    port:587,
                    secure:false,
                    auth:
                    {
                        user:process.env.EMAIL_FROM,
                        pass:process.env.PROD_PASS,
                    }
                }
            );
        }
        return nodemailer.createTransport(
        {
            host:process.env.EMAIL_HOST,
            port:process.env.EMAIL_PORT,
            auth:
            {
                user:process.env.EMAIL_USERNAME,
                pass:process.env.EMAIL_PASSWORD,
            }
        });
    }

    async send(template,subject)  // Send the actual email
    {
        // 1. Render the html for the email based on the pug template
        var html=pug.renderFile(`${__dirname}/../views/email/${template}.pug`,
            {
                firstName:this.firstName,
                url:this.url,
                subject:subject,
            }
        );
        // 2. Define email options
        var mailOptions=
        {
            "from":this.from,
            "to":this.to,
            "subject":subject,
            "html":html,
            "text":htmlToText.htmlToText(html),

        }
        // 3. Create a transport and send email
        await this.newTransport().sendMail(mailOptions);
    }

    async sendWelcome()
    {
        await this.send("welcome","Welcome to the natours family");
    }

    async sendPasswordReset()
    {
        await this.send("passwordReset","Your password reset token (valid for only 10 mins)")
    }

}

// var sendEmail=async (options)=>
// {
    // 1. Create a transporter
    // var transporter=nodemailer.createTransport(
    //     {
    //         host:process.env.EMAIL_HOST,
    //         port:process.env.EMAIL_PORT,
    //         auth:
    //         {
    //             user:process.env.EMAIL_USERNAME,
    //             pass:process.env.EMAIL_PASSWORD,
    //         }
    //     });
    // 2. Define email options
    // var mailOptions=
    // {
    //     "from":"Kush Mazumdar <mazumdarkush2002@gmail.com>",
    //     "to":options.email,
    //     "subject":options.subject,
    //     "text":options.message,

    // }
    // 3. Actually send the email
    // await transporter.sendMail(mailOptions);
// }

// module.exports=sendEmail;