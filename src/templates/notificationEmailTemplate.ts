import { 
  BACKGROUND_COLOR, 
  BACKGROUND_LIGHT_COLOR, 
  BORDER_COLOR, 
  BORDER_RADIUS, 
  FONT, 
  FONT_SIZE_BODY, 
  FONT_SIZE_SMALL, 
  FONT_SIZE_TINY, 
  FONT_WEIGHT, 
  PRIMARY_COLOR, 
  SPACING_SMALL, 
  TEXT_COLOR,
  TEXT_LIGHT_COLOR, 
  TEXT_MUTED_COLOR 
} from "@/constants/stylingConstants";
import { COPYRIGHT } from "@/textCopy/emailCopy";


// can use logo png in email header when I have the logo either in the public dir of the real site or if I upload it to s3 and use the url
// logo must be png
// HEADER
// <tr>
//   <td style="
//     padding: 48px ${SPACING_SMALL};
//     text-align: center;
//     background-color: ${PRIMARY_COLOR};
//   ">
//     <img
//       src="${SITE_URL}/logo.svg"
//       alt="${COMPANY_NAME}"
//       width="175"
//       height="55"
//       style="
//         display: block;
//         margin: 0 auto;
//         width: 175px;
//         height: 55px;
//       "
//     />
//   </td>
// </tr>


const COMPANY_NAME = process.env.COMPANY_NAME;

const notificationEmailTemplate = (
  greeting: string,
  bodyContent: string,
  closingSalutation = "Regards"
) => `
  <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
  <html xmlns="http://www.w3.org/1999/xhtml">
    <head>
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    </head>

    <body style="
      margin: 0;
      padding: 0;
      font-family: ${FONT}, sans-serif;
      background-color: ${BACKGROUND_COLOR};
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    ">

      <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation">
        <tr>
          <td align="center" style="padding: 20px 0;">

            <table
              width="600"
              cellpadding="0"
              cellspacing="0"
              border="0"
              role="presentation"
              style="
                max-width: 768px;
                width: 100%;
                background-color: ${BACKGROUND_LIGHT_COLOR};
                border-radius: ${BORDER_RADIUS};
                overflow: hidden;
                border: 1px solid ${BORDER_COLOR};
              "
            >

              <!-- HEADER -->
              <tr>
                <td style="
                  padding: 48px ${SPACING_SMALL};
                  text-align: center;
                  background-color: ${PRIMARY_COLOR};
                ">
                  <h1 style="
                    margin: 0;
                    color: ${BACKGROUND_COLOR};
                    font-size: 28px;
                    font-weight: ${FONT_WEIGHT};
                  ">
                    ${COMPANY_NAME}
                  </h1>
                </td>
              </tr>

              <!-- BODY -->
              <tr>
                <td style="padding: 40px 24px;">

                  <p style="
                    margin: 0 0 ${SPACING_SMALL} 0;
                    color: ${TEXT_COLOR};
                    font-size: ${FONT_SIZE_BODY};
                    line-height: 1.7;
                  ">
                    ${greeting}
                  </p>

                  ${bodyContent}

                  <p style="
                    margin: 0 0 ${SPACING_SMALL} 0;
                    color: ${TEXT_COLOR};
                    font-size: ${FONT_SIZE_BODY};
                  ">
                    ${closingSalutation},
                  </p>

                  <p style="
                    margin: 0 0 ${SPACING_SMALL} 0;
                    color: ${TEXT_COLOR};
                    font-size: ${FONT_SIZE_BODY};
                  ">
                    Amitha
                  </p>


                  <!-- DIVIDER -->
                  <table width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td style="
                        height: 1px;
                        background-color: ${BORDER_COLOR};
                      ">
                      </td>
                    </tr>
                  </table>

                </td>
              </tr>


              <!-- FOOTER -->
              <tr>
                <td style="
                  padding: 24px;
                  background-color: ${BACKGROUND_LIGHT_COLOR};
                  border-top: 1px solid ${BORDER_COLOR};
                  text-align: center;
                ">

                  <p style="
                    margin: 0 0 4px 0;
                    font-size: ${FONT_SIZE_SMALL};
                    color: ${TEXT_LIGHT_COLOR};
                  ">
                    ${COMPANY_NAME}
                  </p>

                  <p style="
                    margin: 0;
                    font-size: ${FONT_SIZE_TINY};
                    color: ${TEXT_MUTED_COLOR};
                  ">
                    ${COPYRIGHT}
                  </p>

                </td>
              </tr>

            </table>

          </td>
        </tr>
      </table>

    </body>
  </html>
`;

export {
  notificationEmailTemplate
};
