import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable, map, of, switchMap } from 'rxjs';
import type { Response } from '../interfaces';
import { SettingService } from './setting.service';

@Injectable({
  providedIn: 'root',
})
export class UtilService {
  private _endpoint = '';

  constructor(
    @Inject(HttpClient) private _httpClient: HttpClient,
    @Inject(SettingService) private _settingService: SettingService,
  ) {
    this._endpoint = this._settingService.endpoint;
  }

  /**
   * 上传文件
   * @param file 文件
   * @returns 文件路径
   */
  public uploadFile(file: File): Observable<string> {
    if (!file) return of('');
    const url = `${this._endpoint}/api/upload`;
    const formData = new FormData();
    formData.append('file', file);
    return this._httpClient.post<Response<string>>(url, formData).pipe(
      map((response) => response.success ? response.data : ''),
    );
  }

  /**
   * 如果图片大小超过 500kb，压缩图片并上传
   * @param file 文件
   * @returns 文件路径
   */
  public uploadImage(file: File): Observable<string> {
    if (!file) return of('');
    if (file.size <= 500 * 1024) return this.uploadFile(file);
    return this.compressImage(file).pipe(
      map((blob) => new File([blob], file.name, { type: 'image/jpeg' })),
      switchMap((compressedFile) => this.uploadFile(compressedFile)),
    );
  }

  /**
   * 压缩图片
   * @param file 文件
   * @returns Blob
   */
  public compressImage(file: File): Observable<Blob> {
    return new Observable((observer) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const img = new Image();
        img.src = reader.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const width = img.width;
          const height = img.height;
          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob((blob) => {
            observer.next(blob);
            observer.complete();
          }, 'image/jpeg', 0.8);
        };
      };
    });
  }

  /**
   * 获取图片请求地址
   * @param path 图片路径
   */
  public getImageUrl(path: string): string {
    return `${this._endpoint}/api/file?path=${path}`;
  }
}