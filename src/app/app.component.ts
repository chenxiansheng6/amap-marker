import {
  Component,
  Inject,
  signal,
  viewChild,
  type AfterViewInit,
  type ElementRef,
  type OnDestroy,
  type OnInit,
} from '@angular/core';
import { take } from 'rxjs';
import { SidePanelComponent } from './components';
import { Data } from './interfaces';
import { AmapService, DataService } from './services';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: true,
  imports: [
    SidePanelComponent,
  ],
})
export class AppComponent implements OnInit, OnDestroy, AfterViewInit {
  public mapEl = viewChild.required<ElementRef<HTMLDivElement>>('container');

  public showPanel = signal(false);

  public showImageUrl = signal('');

  public browserBroadcastChannel: BroadcastChannel;

  constructor(
    @Inject(AmapService) private _amapService: AmapService,
    @Inject(DataService) private _dataService: DataService,
  ) {}

  ngOnInit(): void {
    this.browserBroadcastChannel = new BroadcastChannel('amap');
    this.browserBroadcastChannel.onmessage = (e) => {
      const { type, payload } = e.data;
      if (type === 'openImage' && payload) {
        this.showImageUrl.set(payload.replace(/\\\\/g, '\\'));
      }
    };
  }

  ngOnDestroy(): void {
    this.browserBroadcastChannel.close();
  }

  ngAfterViewInit(): void {
    this._amapService.initMap(this.mapEl().nativeElement);

    this._dataService.getData().pipe(take(1)).subscribe((data) => {
      this.createMarkers(data);
    });
  }

  public createMarkers(data: Data[]): void {
    for (const item of data) {
      const marker = new AMap.Marker({
        position: [+item.lng, +item.lat],
        anchor:'bottom-center',
      });
      marker.setMap(this._amapService.map);
      marker.on('click', (e) => {
        this.setInfoWindow({ target: e.target, data: item });
      });
      this._dataService.markers.set(item.id, marker);
    }
    this._amapService.map?.setFitView();
  }

  public setInfoWindow(e): void {
    const { target, data } = e;
    const imgHtmlStr = this.getImgHtmlStr(data.images);
    const infoWindow = new AMap.InfoWindow({
      isCustom: true,
      offset: new AMap.Pixel(0, -34),
      content: `
        <div class="p-3 bg-white shadow-md rounded-md max-w-96">
          <div class="flex justify-between items-center">
            <span class="font-semibold">${data.name}</span>
            <img src="common/close.svg" class="w-6 h-6 cursor-pointer info-close">
          </div>
          <p class="text-sm mt-1 mb-2">${data.description || ''}</p>
          <div class="grid grid-cols-3 grid-flow-row gap-3">${imgHtmlStr}</div>
        </div>
      `,
    });
    infoWindow.open(this._amapService.map, target.getPosition());
    this.registerCloseEvent(infoWindow);
  }

  public registerCloseEvent(infoWindow: AMap.InfoWindow): void {
    const closeBtn = Array.from(document.getElementsByClassName('info-close'));
    for (const btn of closeBtn) {
      btn.addEventListener('click', () => {
        infoWindow.close();
      }, { once: true });
    }
  }

  public getImgHtmlStr(images: string[]): string {
    if (!images || !images.length) return '';
    return images
      .filter((_) => _)
      .map((img) =>
        `<img src="${img}" class="h-32 w-full rounded-lg shadow object-cover cursor-pointer" onclick="postMessage({
          type: 'openImage',
          payload: '${img.replace(/\\/g, "\\\\")}',
        })">`
      )
      .join('');
  }
}
