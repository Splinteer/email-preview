export const SAMPLE_HTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto" />
  <style>
    @import url('https://fonts.googleapis.com/css?family=Open+Sans');
    body { margin: 0; font-family: Arial, sans-serif; background: #f5f5f5; }
    .wrap { max-width: 600px; margin: 0 auto; background: #fff; }
    .hero { padding: 24px; background: #0b3d5c; color: #fff; }
    .btn { display: flex; gap: 8px; border-radius: 8px; background: #0078d4; color: #fff; padding: 12px 20px; text-decoration: none; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="hero">
      <h1>Appel d'offres transport</h1>
      <p>Contactez-nous au 06 12 34 56 78 ou via supplydatahub.com</p>
      <p>Clôture le 14/11/2026</p>
    </div>
    <div style="padding:24px">
      <img src="https://cdn.example.com/hero.png" alt="Illustration flotte" width="552" height="180" />
      <p>Comparez vos devis transporteurs sans tableur.</p>
      <a class="btn" href="https://example.com/campaign">https://example.com/campaign</a>
      <!--[if mso]>
      <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" fillcolor="#0078d4" stroke="f" style="width:200px;height:40px;">
        <v:textbox inset="0,0,0,0"><div style="text-align:center;color:#fff;">MSO CTA</div></v:textbox>
      </v:roundrect>
      <![endif]-->
    </div>
  </div>
</body>
</html>`;
