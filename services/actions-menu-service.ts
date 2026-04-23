import { ConnectedPosition, Overlay, OverlayRef } from "@angular/cdk/overlay";
import { CdkPortal, TemplatePortal } from "@angular/cdk/portal";
import { Injectable, Signal, TemplateRef, ViewContainerRef } from "@angular/core";
import { BehaviorSubject } from "rxjs";

@Injectable({ providedIn: 'root' })
export class ActionMenuService {
  private readonly openedIdSubject = new BehaviorSubject<string | null>(null);
  readonly openedId$ = this.openedIdSubject.asObservable();

  private overlayRef: OverlayRef | null = null;

  constructor(private overlay: Overlay) {}

  get currentId(): string | null {
    return this.openedIdSubject.value;
  }

  open(
    id: string,
    trigger: HTMLElement,
    portalTemplate: TemplateRef<unknown>,
    viewContainerRef: ViewContainerRef,
    position: ConnectedPosition[]
  ): void {
    if (this.overlayRef) {
      this.close();
    }

    const positionStrategy = this.overlay.position()
      .flexibleConnectedTo(trigger)
      .withPositions(position)
      .withPush(true);

    this.overlayRef = this.overlay.create({
      positionStrategy,
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
    });

    this.overlayRef.backdropClick().subscribe(() => this.close());
    this.overlayRef.detachments().subscribe(() => this.cleanup());

    const portal = new TemplatePortal(portalTemplate, viewContainerRef);
    this.overlayRef.attach(portal);

    this.openedIdSubject.next(id);
  }

  toggle(
    id: string,
    trigger: HTMLElement,
    portalTemplate: TemplateRef<unknown>,
    viewContainerRef: ViewContainerRef,
    position: ConnectedPosition[]
  ): void {
    if (this.currentId === id && this.overlayRef) {
      this.close();
      return;
    }

    this.open(id, trigger, portalTemplate, viewContainerRef, position);
  }

  close(): void {
    this.overlayRef?.dispose();
    this.cleanup();
  }

  private cleanup(): void {
    this.overlayRef = null;
    this.openedIdSubject.next(null);
  }
}
