import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { EconodataAdminService, Data } from 'src/app/services/admin/econodata-admin.service';
import { NotificationService } from 'src/app/core/services/notification.service';


function atLeastOneRequired(fileControl: () => File | null): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        const enlaceValue = control.value;
        const fileValue = fileControl();

        if (!enlaceValue && !fileValue) {
            return { atLeastOneRequired: true };
        }

        return null;
    };
}

@Component({
    selector: 'app-econodata-admin',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, FormsModule],
    templateUrl: './econodata.component.admin.html',
    styleUrls: ['./econodata.component.admin.scss']
})
export class EconodataAdminComponent implements OnInit {

    dataForm!: FormGroup;

    isEditMode = false;
    currentId: string | null = null;

    file: File | null = null;
    fileSizeMB = 0;

    existingFileUrl: string | null = null;

    categories: string[] = [
        'Macroeconomía', 'Microeconomía', 'Finanzas', 'Estadística',
        'Mercados', 'Otros'
    ];

    constructor(
        private fb: FormBuilder,
        private service: EconodataAdminService,
        private router: Router,
        private route: ActivatedRoute,
        private notificationService: NotificationService
    ) { }

    ngOnInit(): void {
        this.dataForm = this.fb.group({
            title: ['', Validators.required],
            enlace: [''],
            category: ['', Validators.required],
            createdAt: [{ value: '', disabled: true }],
            updatedAt: [{ value: '', disabled: true }]
        });

        this.dataForm.get('enlace')?.setValidators([
            atLeastOneRequired(() => this.file)
        ]);

        this.route.params.subscribe(params => {
            if (params['id']) {
                this.isEditMode = true;
                this.currentId = params['id'];
                this.loadData(params['id']);
            } else {
                const now = new Date().toISOString();
                this.dataForm.patchValue({ createdAt: now, updatedAt: now });
            }
        });
    }

    async loadData(id: string): Promise<void> {
        try {
            const item = await this.service.getById(id);

            if (!item) {
                this.notificationService.error('Elemento no encontrado.');
                return this.goDashboard();
            }

            this.dataForm.patchValue({
                title: item.title,
                category: item.category,
                enlace: item.accessUrl || '',
                createdAt: item.createdAt,
                updatedAt: item.updatedAt
            });

            this.existingFileUrl = item.fileUrl ?? null;
            this.dataForm.get('enlace')?.updateValueAndValidity();

        } catch (err) {
            console.error(err);
            this.notificationService.error('No se pudo cargar la información.');
            this.goDashboard();
        }
    }

    goDashboard() {
        this.router.navigate(['/admin']);
    }

    goTable() {
        this.router.navigate(['/admin/data']);
    }

    onFileSelected(event: any) {
        const file = event.target.files[0];
        if (!file) return;

        const sizeMB = file.size / 1024 / 1024;

        this.file = file;
        this.fileSizeMB = Number(sizeMB.toFixed(2));
        this.dataForm.get('enlace')?.updateValueAndValidity();
    }

    removeFile() {
        this.file = null;
        this.fileSizeMB = 0;

        this.dataForm.get('enlace')?.updateValueAndValidity();
    }

    openFile() {
        if (this.file) {
            window.open(URL.createObjectURL(this.file), "_blank");
        } else if (this.existingFileUrl) {
            window.open(this.existingFileUrl, "_blank");
        }
    }

    async save() {

        if (this.dataForm.invalid) {
            this.dataForm.markAllAsTouched();

            if (this.dataForm.get('enlace')?.hasError('atLeastOneRequired')) {
                return this.notificationService.info('Debe proporcionar al menos un enlace o adjuntar un archivo.');
            }

            return this.notificationService.warning('Complete los campos obligatorios.');
        }

        const formData: Partial<Data> = {
            title: this.dataForm.value.title,
            category: this.dataForm.value.category,
            accessUrl: this.dataForm.value.enlace || null,
            fileUrl: this.existingFileUrl || null
        };

        if (!this.isEditMode) {
            const now = new Date().toISOString();
            this.dataForm.patchValue({ createdAt: now, updatedAt: now });
        }

        formData.updatedAt = new Date().toISOString();

        try {
            if (this.isEditMode && this.currentId) {
                await this.service.updateData(this.currentId, formData, this.file);
                this.notificationService.success('Elemento actualizado.');
            } else {
                await this.service.addData(formData as Data, this.file!);
                this.notificationService.success('Elemento creado.');
            }

            this.resetForm();
            this.goTable();

        } catch (err) {
            console.error(err);
            this.notificationService.error('Error al guardar.');
        }
    }

    resetForm() {
        this.dataForm.reset();
        this.file = null;
        this.fileSizeMB = 0;
        this.existingFileUrl = null;
    }

    cancel() {
        if (confirm('¿Desea cancelar?')) {
            this.resetForm();
            this.goTable();
        }
    }

    visitar() {
        const link = this.dataForm.get('enlace')?.value;
        if (link) window.open(link, "_blank");
    }
}
