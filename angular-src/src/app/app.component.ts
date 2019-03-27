import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators, FormArray } from '@angular/forms';



@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'angular-src';
  isAddingData: boolean = false;
  dataForm: FormGroup;

  constructor(private _formBuilder: FormBuilder) {
    this.dataForm = this.createForm();
  }

  addData() { 
    this.isAddingData = true;
  }

  createForm() : FormGroup {
    return this._formBuilder.group({
      date : new FormControl(''),
      dogName: new FormControl(''),
      orderOfBowls: new FormControl(''),
      chickenBowl: new FormControl(''),
      nBowlsVisited: new FormControl(''),
      bowlsVisitedOrder: new FormControl([]),
      timeToChicken: new FormControl(''),
      comments: new FormControl('')
    });
  }
}
