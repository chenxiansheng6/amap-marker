import {
  Component,
  Inject,
  viewChild,
  type OnInit,
  type ElementRef,
  type AfterViewInit,
  signal,
} from '@angular/core';
import { take } from 'rxjs';
import { AmapService, DataService } from './services';
import { SidePanelComponent } from './components';
import { Data } from './interfaces';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: true,
  imports: [
    SidePanelComponent,
  ],
})
export class AppComponent implements OnInit, AfterViewInit {
  public mapEl = viewChild.required<ElementRef<HTMLDivElement>>('container');

  public showPanel = signal(false);

  constructor(
    @Inject(AmapService) private _amapService: AmapService,
    @Inject(DataService) private _dataService: DataService,
  ) {}

  ngOnInit(): void {}

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
    const infoWindow = new AMap.InfoWindow({
      isCustom: true,
      offset: new AMap.Pixel(0, -34),
      content: `
        <div class="p-3 bg-white shadow-md rounded-md">
          <div class="flex justify-between items-center mb-2">
            <span class="font-semibold">${data.name}</span>
            <img src="common/close.svg" class="w-6 h-6 cursor-pointer info-close">
          </div>
          <p class="text-sm">${data.description}</p>
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
}
