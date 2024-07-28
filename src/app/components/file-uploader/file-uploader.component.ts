import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component, type ElementRef, type OnInit, input, output, signal, viewChild } from '@angular/core';

@Component({
  selector: 'app-file-uploader',
  templateUrl: './file-uploader.component.html',
  standalone: true,
  imports: [
    NgIf,
    NgClass,
    NgFor,
  ],
})
export class FileUploaderComponent implements OnInit {
  public fileInput = viewChild<ElementRef<HTMLInputElement>>('fileInput');

  public accept = input.required<string>();
  public multiple = input(false);
  public hideAreaAfterUpload = input(false);
  public imgClassName = input('thumbnail');
  public maxFiles = input(1);

  public filesOnChange = output<File[]>();

  public uploadFiles = signal<File[]>([]);
  public hideArea = signal(false);

  ngOnInit(): void {}

  public onFileUploadTriggered() {
    this.fileInput().nativeElement.value = '';
  }

  public onFileUpload(event: Event): void {
    const target = event.target as HTMLInputElement;
    const files = this.uploadFiles().concat(Array.from(target.files));
    this.uploadFiles.set(files);
    this.renderThumbnail();
    this.filesOnChange.emit(files);
    this.hideArea.set(this.hideAreaAfterUpload());
  }

  public removeImage(index: number): void {
    const files = this.uploadFiles();
    files.splice(index, 1);
    this.uploadFiles.set(files);
    this.renderThumbnail();
    this.filesOnChange.emit(files);
    if (this.uploadFiles().length === 0) {
      this.hideArea.set(false);
    }
  }

  public renderThumbnail(): void {
    const imgs = document.getElementsByClassName(
      this.imgClassName(),
    ) as HTMLCollectionOf<HTMLImageElement>;
    for (const [index, file] of this.uploadFiles().entries()) {
      const reader = new FileReader();
      reader.onload = (e) => {
        imgs[index].src = e.target?.result as string;
        imgs[index].classList.add(...['w-full', 'h-full', 'object-cover']);
      };
      reader.readAsDataURL(file);
    }
  }
}
