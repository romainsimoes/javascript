const express = require("express")
const path = require("path")
const Mocha = require("mocha")
const fs = require("fs")
const showdown = require("showdown")

const app = express()
const port = 3010
const mocha = new Mocha({ reporter: "mochawesome" })

app.use(express.static("mochawesome-report"))

app.get("/favicon.ico", (_req, res) => res.status(204))

app.get("/", (_req, res) => {
  const files = fs.readdirSync("./challenges").map((file) => file.replace(".js", ""))
  const html = `
    <html>
        <head></head>
        <body>
            <ul>
                <ul>
                    ${files
                      .map(
                        (file, index) =>
                        `<li>
                            <h3>
                                Challenge ${index + 1}
                            </h3>
                            <div>
                                <a href="/${file}/readme">${file} <span class="instructions">instructions</span></a>
                            </div>
                            <div>
                                <a href="/${file}">${file} <span class="test">tests</span></a>
                            </div>
                        </li>`
                      ).join("")}
                </ul>
            </ul>
        </body>
    </html>
    <style>
        body {
            font-size: 20px;
            font-weight: 600;
            font-family: sans-serif;
            color: gray;
            
        }
        li {
            margin: 10px;
        }
        .instructions {
            color: blue;
        }
        .test {
            color: orange;
        }
        a {
            transition: all .1s ease-in-out;
            text-decoration: none;
        }
        a:hover {
            color: black;
            font-size: 22px;
        }
    </style>
    `
  res.send(html)
})

app.get("/:file/readme", (req, res) => {
  const converter = new showdown.Converter()
  const text = fs.readFileSync(path.resolve(`readme/${req.params.file}.md`), "utf8")
  const html = converter.makeHtml(text)
  res.send(`${html}<style>body { font-family: sans-serif; }</style>`)
})

app.get("/:file", (req, res) => {
  mocha.addFile(`specs/${req.params.file}.js`)
  mocha.cleanReferencesAfterRun(false)

  mocha.run(() =>
    Promise.resolve((resolve) => setTimeout(resolve, 2000)).then(() =>
      res.sendFile(path.resolve("mochawesome-report/mochawesome.html"))
    )
  )
})

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`)
})
