import { Injectable } from "@angular/core";

@Injectable({ providedIn: 'root'})
export class BlurService{

    public blurId: string;

    setCurrentBlurId(id: string){
        this.blurId = id;
    }
    
    public get currentBlurId() : string {
        return this.blurId
    }
}