import { OverlayRef } from '@angular/cdk/overlay';


export class CloseModalService {

    close(overlayRef: OverlayRef){
        const element = overlayRef.overlayElement.children[0];

        console.log(`Close modal: ${element}`);
    }
}