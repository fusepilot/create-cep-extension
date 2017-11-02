module.exports = function({ title = 'CEP Panel', port = 3000 }) {
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
</html>`;
};
