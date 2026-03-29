import { Injectable, ElementRef } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class Descarga {

  downloadBlob(blob : Blob, filename: string, extension: string){
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = filename + extension;
    link.click();

    window.URL.revokeObjectURL(url);
  }

  printReport(el: HTMLElement | undefined) {
    if (!el) return;

    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.width = '0px';
    iframe.style.height = '0px';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) return;

    const styles = document.querySelectorAll('link[rel="stylesheet"], style');
    styles.forEach(style => {
      doc.head.appendChild(style.cloneNode(true));
    });

    const styleCustom = doc.createElement('style');
    styleCustom.innerHTML = `
      body { padding: 2cm !important; background: white !important; }
      @page { margin: 0; }
      * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    `;
    doc.head.appendChild(styleCustom);
    doc.body.innerHTML = el.outerHTML;

    iframe.onload = () => {
      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        document.body.removeChild(iframe);
      }, 500);
    };

    if (doc.readyState === 'complete') {
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
          document.body.removeChild(iframe);
        }
      }, 800);
    }
  }

}
