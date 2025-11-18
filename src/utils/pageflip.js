// src/utils/pageflip.js
import { PageFlip } from '../utils/page-flip.module.js';


export async function startFlip(thebookRef, onFlip) {

    const pageFlip = new PageFlip(thebookRef.value, {
        width: 1024, // base page width
        height: 1200, // base page height
        size: 'stretch',
        maxWidth:  1024,
        maxHeight:1200,
        minWidth: 280,
        maxShadowOpacity: 0.3, // Half shadow intensity
        showCover: true,
        //useMouseEvents: false,
        disableFlipByClick: true,
        showPageCorners: false,
        mobileScrollSupport: false,
        flippingTime: 400
    });


    

    pageFlip.loadFromHTML(document.querySelectorAll('.page'));

    
    if (onFlip) {
        pageFlip.on('flip', (e)=>{
            onFlip(e)
        });
    }
    return pageFlip;
}

export function goToPageFromHash(pageFlipInstance) {
    if (!pageFlipInstance) return;
    const hash = window.location.hash;
    const match = hash.match(/^#p(\d+)$/);
    if (match) {
        const pageNum = parseInt(match[1], 10);
        pageFlipInstance.turnToPage(pageNum);
    }
}
