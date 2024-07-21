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
import { AmapService, DataService, GeoLocationService } from './services';
import { SidePanelComponent } from './components';

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
    @Inject(GeoLocationService) private _geoLocationService: GeoLocationService,
  ) {}

  ngOnInit(): void {
    this._dataService.getData()
      .pipe(take(1))
      .subscribe();
  }

  ngAfterViewInit(): void {
    this._amapService.initMap(this.mapEl().nativeElement);
    
    this._geoLocationService.getLocation()
      .pipe(take(1))
      .subscribe((position) => {
        const { longitude, latitude } = position.coords;
        this._amapService.map?.setCenter([longitude, latitude]);
        // this._amapService.showCurrent({ longitude, latitude });
      });
  }
}
