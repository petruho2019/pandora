import { Injectable } from "@angular/core";

@Injectable({ providedIn: 'root'})
export class BlurService{

    public blurId: string | null;

    public setCurrentBlurId(id: string){
        this.blurId = id;
    }

    public get currentBlurId() : string {
        return this.blurId as string
    }

    public clearBlur() {
        this.blurId = null;
    }

    
}