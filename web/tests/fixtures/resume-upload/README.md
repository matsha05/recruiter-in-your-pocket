# Synthetic upload fixtures

These files contain the same fictional Alex Example resume. The PDF was generated with ReportLab and the DOCX with python-docx. They contain no customer data.

The PDF is a valid, one-page PDF 1.3 document, independently read with `pypdf` in strict mode. Both formats preserve the companion text after whitespace normalization. The regression test uses the real upload route and parsers to catch PDF byte-offset failures that mocked extraction would miss.
