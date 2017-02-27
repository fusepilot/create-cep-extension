module.exports = function ({
  env = 'dev',
  title = 'CEP Panel',
  port = 3000,
}) {
  if (env === 'dev') {
return `<!DOCTYPE html>
<html>
  <head>
    <title>${title}</title>
  </head>
  <body>
    <script>
      window.location.href = "http://localhost:${port}";
    </script>
  </body>
</html>`
  } else {
    return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" type="text/css" href="./css/main.css">
    <title>${title}</title>
  </head>
  <body>
    <div id="root"></div>
    <script src="./js/main.js"></script>
  </body>
</html>`
  }
}
