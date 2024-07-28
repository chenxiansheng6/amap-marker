import { NgClass, NgFor, NgIf } from '@angular/common';
import {
  Component,
  Inject,
  type OnDestroy,
  type OnInit,
  effect,
  input,
  output,
  signal,
} from '@angular/core';
import {
  FormBuilder,
  type FormControl,
  type FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { slideInRight } from '../../animations';
import { AmapService, DataService, UtilService } from '../../services';
import { forkJoin, Subject, switchMap, take, takeUntil } from 'rxjs';
import { DialogService } from '../dialog';
import type { Data } from '../../interfaces';
import { FileUploaderComponent } from '../file-uploader/file-uploader.component';

@Component({
  selector: 'app-side-panel',
  templateUrl: './side-panel.component.html',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    NgClass,
    FormsModule,
    ReactiveFormsModule,
    FileUploaderComponent,
  ],
  animations: [slideInRight],
})
export class SidePanelComponent implements OnInit, OnDestroy {
  // input 是否显示面板
  public show = input<boolean>(false);

  // output 打开/关闭面板
  public toggle = output<boolean>();

  // 列表数据源
  public dataSource = signal<Data[]>([]);

  // 操作模式
  public mode = signal<'view' | 'edit' | 'delete' | 'create'>('view');
  // 创建模式时拾取的覆盖物
  public createMarker = signal<AMap.Marker | null>(null);

  public dataForm: FormGroup<{
    id: FormControl<string | null>;
    name: FormControl<string | null>;
    description: FormControl<string | null>;
    lng: FormControl<string | null>;
    lat: FormControl<string | null>;
    images: FormControl<string[] | null>;
  }>;

  #unsubscribeAll = new Subject<null>();

  constructor(
    @Inject(FormBuilder) private _fb: FormBuilder,
    @Inject(AmapService) private _amapService: AmapService,
    @Inject(DataService) private _dataService: DataService,
    @Inject(UtilService) private _utilService: UtilService,
    @Inject(DialogService) private _dialogService: DialogService,
  ) {
    effect(() => {
      if (this.mode() === 'create' || this.mode() === 'view') this.initForm();
    });
  }

  public initForm(): void {
    if (this.dataForm) {
      this.dataForm.reset();
      return;
    }
    this.dataForm = this._fb.group({
      id: [''],
      name: ['', Validators.required],
      description: [''],
      lng: ['', Validators.required],
      lat: ['', Validators.required],
      images: [null],
    });
  }

  ngOnInit(): void {
    this._dataService.dataSource$
      .pipe(takeUntil(this.#unsubscribeAll))
      .subscribe((data) => {
        this.dataSource.set(data);
      });
  }

  ngOnDestroy(): void {
    this.#unsubscribeAll.next(null);
    this.#unsubscribeAll.complete();
  }

  public tooglePanel(): void {
    this.toggle.emit(!this.show());
  }

  public changeMode(mode: 'view' | 'edit' | 'delete' | 'create'): void {
    this.mode.set(mode);
  }

  /***************** 标记列表 点击/编辑/删除 *****************/
  // 列表项点击聚焦至覆盖物
  public focusMarker(data: Data): void {
    this._amapService.map.setCenter([+data.lng, +data.lat]);
    this._amapService.map.setZoom(15);
  }
  public editData(event: Event, data: Data): void {
    event.stopPropagation();
    this.mode.set('edit');
    this.dataForm.patchValue(data);
  }
  public deleteData(event: Event, data: Data): void {
    event.stopPropagation();
    const dialogRef = this._dialogService.open({
      title: '删除标记',
      message: '确定删除该标记？',
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'confirmed')
        this._dataService.deleteData(data.id)
          .pipe(take(1)).subscribe();
    });
  }

  /***************** 创建/编辑 *****************/
  public operating = signal(false);
  public uploadFiles: File[] = [];
  public errorMsg = signal<string>('');
  // 取消创建
  public cancelUpdate(): void {
    this.mode.set('view');
    this.deleteCoords();
    this.dataForm.reset();
  }
  // 保存创建/更新
  public save(): void {
    this.mode() === 'create' ? this.create() : this.update();
  }
  // 创建
  public create(): void {
    this.operating.set(true);

    forkJoin(this.uploadFiles.map((_) =>
      this._utilService.uploadImage(_)
    )).pipe(
      take(1),
      switchMap((images) => {
        this.dataForm.patchValue({ 
          images: images.filter((_) => _),
        });
        return this._dataService.createData(this.dataForm.value);
      }),
    )
    .subscribe({
      next: () => {
        this.operating.set(false);
        this.mode.set('view');
        this.createMarker.set(null);
        this.dataForm.reset();
      },
      error: () => {
        this.operating.set(false);
      },
    });
  }
  // 更新
  public update(): void {
    const data = this.dataForm.getRawValue();

    this._dataService.updateData(data)
      .pipe(take(1))
      .subscribe(() => {
        this.mode.set('view');
        this.createMarker.set(null);
        this.dataForm.reset();
      });
  }
  // 拾取坐标
  public pickCoords(): void {
    this.operating.set(true);
    this._amapService.map.setDefaultCursor('crosshair');

    if (this.createMarker()) {
      this.deleteCoords();
      this.dataForm.patchValue({
        lng: '',
        lat: '',
      });
    }

    this._amapService.map.on('click', (e) => {
      const { lng, lat } = e.lnglat;
      this.dataForm.patchValue({
        lng: lng,
        lat: lat,
      });
      this._amapService.map.setDefaultCursor('default');
      this.createMarker.set(new AMap.Marker({
        position: [lng, lat],
        anchor:'bottom-center',
      }));
      this._amapService.map.add(this.createMarker());
      this.operating.set(false);
    }, this, true);
  }
  // 删除拾取的坐标
  public deleteCoords(): void {
    if (this.createMarker()) {
      this._amapService.map.remove(this.createMarker());
      this.createMarker.set(null);
    }
  }

  public onFileUpload(event: File[]): void {
    if (!event) return;
    this.errorMsg.set('');

    if (event.length > 0) {
      if (event.some((_) => _.size > 10 * 1024 * 1024)) {
        this.errorMsg.set('上传图片大小不能超过 10MB，请重新上传');
        return;
      }
      this.uploadFiles = event;
    } else {
      this.uploadFiles = [];
    }
  }

  public removeImage(index: number): void {
    this.dataForm.patchValue({
      images: this.dataForm.value.images.filter((_, i) => i !== index),
    });
  }
}
