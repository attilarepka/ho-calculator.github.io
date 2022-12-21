import {
    AfterViewInit,
    Component,
    HostListener,
    QueryList,
    ViewChildren
} from '@angular/core';
import {FileSaverService} from 'ngx-filesaver';

import {
    MatCalendarWrapperComponent
} from './components/mat-calendar-wrapper/mat-calendar-wrapper.component';
import {
    FileServiceComponent
} from './services/file-service/file-service.component';

interface Payload {
    homeOfficeLimit: number;
    annualLeaveLimit: number;
    daysMap: Map<string, string>;
    currentYear: number;
}

@Component({
    selector : 'app-root',
    templateUrl : './app.component.html',
    styleUrls : [ './app.component.css' ],
})
export class AppComponent implements AfterViewInit {
    payload: Payload;
    selectionType: string = "homeoffice";
    title = 'ho-calc';
    fileService: any;
    selectedFile: File;

    @ViewChildren("calendarChildren")
    calendarChildren: QueryList<MatCalendarWrapperComponent>;

    constructor() {
        this.fileService = new FileServiceComponent(new FileSaverService);
        this.payload = {
            currentYear : 2023,
            homeOfficeLimit : 150,
            daysMap : new Map<string, string>,
            annualLeaveLimit : 0
        }
    }

    ngAfterViewInit() {}

    getNotification(event: any) {
        const key = event.key;
        if (this.payload.daysMap.get(key) == this.selectionType)
            this.payload.daysMap.delete(key);
        else
            this.payload.daysMap.set(key, this.selectionType);
    }

    savePayload() {
        const payloadJSON = JSON.parse(JSON.stringify(this.payload));
        const array = Array.from(this.payload.daysMap,
                                 ([ date, type ]) => ({date, type}));
        payloadJSON.daysMap = array;
        this.fileService.onSave(JSON.stringify(payloadJSON));
    }

    loadPayload(payload: any) {
        this.selectedFile = payload.target.files[0];
        const fileReader = new FileReader();
        fileReader.readAsText(this.selectedFile, "UTF-8");
        fileReader.onload = () => {
            const input = JSON.parse(fileReader.result as string);
            this.payload.currentYear = input.currentYear;
            this.payload.annualLeaveLimit = input.annualLeaveLimit;
            this.payload.homeOfficeLimit = input.homeOfficeLimit;
            input.daysMap.forEach(
                (key: any) => {this.payload.daysMap.set(key.date, key.type)});

            this.calendarChildren.forEach(
                (child) => child.updateDaysMap(this.payload.daysMap));
        };
        fileReader.onerror = (error) => { console.log(error); };
    }

    @HostListener('contextmenu', [ '$event' ])
    onRightClick(event: {preventDefault: () => void}) {
        event.preventDefault();
    }
}
