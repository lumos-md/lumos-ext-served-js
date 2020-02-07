// Add our styles to the page
function addStylesheet(doc, link, classN) {
    var path = chrome.extension.getURL(link),
        styleLink = document.createElement("link");

    styleLink.setAttribute("rel", "stylesheet");
    styleLink.setAttribute("type", "text/css");
    styleLink.setAttribute("href", path);

    if(classN)
        styleLink.className = classN;
    doc.head.appendChild(styleLink);
}

const getGeneratedPageURL = ({ html, css, js }) => {
  const getBlobURL = (code, type) => {
    const blob = new Blob([code], { type })
    return URL.createObjectURL(blob)
  }

  const cssURL = getBlobURL(css, 'text/css')
  const jsURL = getBlobURL(js, 'text/javascript')

  const source = `
    <html>
      <head>
        ${css && `<link rel="stylesheet" type="text/css" href="${cssURL}" />`}
      </head>
      <body>
        ${html || ''}
        ${js && `<script src="${jsURL}"></script>`}
      </body>
    </html>
  `

  return getBlobURL(source, 'text/html')
}

function htmlTableOfContents (document) {
	var headingTags = []
    var documentRef = document;
    var headings = [].slice.call(document.body.querySelectorAll('h1, h2, h3'));
    headings.forEach(function (heading, index) {
        var anchor = documentRef.createElement('a');
        anchor.setAttribute('name', 'toc' + index);
        anchor.setAttribute('id', 'toc' + index);

        headingTags.push({
            tag: heading.tagName.toLowerCase(),
            text: heading.textContent,
            href: '#toc' + index
        })
        heading.parentNode.insertBefore(anchor, heading);
	});
	return headingTags;
}

function getPlaintextSectionsFromReadabilityDocument(doc) {
  textBlocks = {}
  currentHeading = ''
  current = []
  for (const e of doc.querySelector('p').parentElement.children) {
    if (['h1', 'h2', 'h3'].includes(e.tagName.toLowerCase()) && current.length > 0)   {
      textBlocks[currentHeading] = current.join('\n')
      currentHeading = e.textContent
      current = []
    } else {
      if (['p', 'ul', 'blockquote'].includes(e.tagName.toLowerCase())) {
          current.push(e.textContent)
      }
    }
  }
  textBlocks[currentHeading] = current.join('\n')
  return textBlocks
}