// import from ("dotenv")

import * as SparkPost from "sparkpost";
const client = new SparkPost(process.env.SPARKPOST_API_KEY);

export const sendEmail = async (recipient: string, url: string) => {
  // console.log("process.env.SPARKPOST_API_KEY");
  // console.log(process.env.SPARKPOST_API_KEY);
  // console.log(recipient);
  // console.log(url);
  const response = await client.transmissions.send({
    // options: {
    //   sandbox: true
    // },
    content: {
      from: "eddienaff@gmail.com",
      subject: "Confirm email",
      html: `<html><body>
        <p>Testing SparkPost - the world's most awesomest email service!</p>
        <a href="${url}">Click this link</a>
        </body></html>`
    },
    recipients: [{ address: recipient }]
  });

  console.log("VIEW response");
  console.log(response);
  // .then(data => {
  //   console.log("Woohoo! You just sent your first mailing!");
  //   console.log(data);
  // })
  // .catch(err => {
  //   console.log("Whoops! Something went wrong");
  //   console.log(err);
  // });
};
