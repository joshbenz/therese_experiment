import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators, FormArray } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';



@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'angular-src';
  isAddingData: boolean = false;
  dataForm: FormGroup;
  private debounce: number = 400;

  dogs = ['Myia', 'Mika', 'Ali'];
  bowls = ['White', 'Clear', 'Red', 'Blue', 'Yellow'];
  nVisits = 0;
  render = false;

  constructor(private _formBuilder: FormBuilder) {
  }

  ngOnInit() {
    this.dataForm = this.createForm();

    this.dataForm.controls['nBowlsVisited'].valueChanges
      .pipe(debounceTime(this.debounce), distinctUntilChanged())
      .subscribe(query => {
        this.nVisits = query;
        //this.dataForm.controls.bowlsVisitedOrder.setValue(Array(this.nVisits));
        const visited = this.dataForm.controls.bowlsVisitedOrder as FormArray

        for(let i=0; i<this.nVisits; i++) {
            visited.push(this._formBuilder.group({bowl: 'white'}));
        }
        console.log(this.dataForm.get('bowlsVisitedOrder'));

      });
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
      bowlsVisitedOrder: this._formBuilder.array([]),
      timeToChicken: new FormControl(''),
      comments: new FormControl('')
    });
  }

  onSearchChange(searchValue : string ) {  
    console.log(searchValue);}
}
