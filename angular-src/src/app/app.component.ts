import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators, FormArray } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { AuthService } from './services/auth.service';
import { DataService } from './services/data.service';
import { Angular5Csv } from 'angular5-csv/dist/Angular5-csv';
import * as CanvasJS from './canvasjs.min';


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
  isloggingIn = false;
  email = '';
  password='';
  asdf = 'AliIsTheBest';
  ASDF = false;

  constructor(private _formBuilder: FormBuilder,
              public _authService: AuthService,
              private _dataService: DataService) {
  }

  ngOnInit() {
    //console.log(localStorage.getItem('auth'))
    this.dataForm = this.createForm();
    this.refresh();

    /*let chart = new CanvasJS.Chart("chartContainer", {
      animationEnabled: true,
      exportEnabled: true,
      title: {
        text: "Basic Column Chart in Angular"
      },
      data: [{
        type: "column",
        dataPoints: [
          { y: 71, label: "Apple" },
          { y: 55, label: "Mango" },
          { y: 50, label: "Orange" },
          { y: 65, label: "Banana" },
          { y: 95, label: "Pineapple" },
          { y: 68, label: "Pears" },
          { y: 28, label: "Grapes" },
          { y: 34, label: "Lychee" },
          { y: 14, label: "Jackfruit" }
        ]
      }]
    });
      
    chart.render();*/

    this._dataService.getDatapoints().subscribe(data => {
      for(let dataPoint of data as any) {
        dataPoint.orderOfBowls = JSON.parse(dataPoint.orderOfBowls);
        dataPoint.bowlsVisitedOrder = JSON.parse(dataPoint.bowlsVisitedOrder);
      }

      let aliBowlsCheckedBarChart = this.bowlsChecked('Ali', JSON.parse(JSON.stringify(data)))
    });
  }

  bowlsChecked(dog, APIdata) {
    let data = APIdata.filter(x => {return x.dogName.toLowerCase() == dog.toLowerCase()});
    
  }

  refresh() : void {
    this.dataForm.controls['nBowlsVisited'].valueChanges
      .pipe(debounceTime(this.debounce), distinctUntilChanged())
      .subscribe(query => {
        this.nVisits = query;
        console.log(query);
        const visited = this.dataForm.controls.bowlsVisitedOrder as FormArray;

        for(let i=0; i<this.nVisits; i++) {
            visited.push(this._formBuilder.group({bowl: ''}));
        }

        while(visited.length > this.nVisits) visited.removeAt(visited.length-1);
      });
  }

  addData() { 
    this.isAddingData = true;
    this.refresh();
  }

  createForm() : FormGroup {
    let form =  this._formBuilder.group({
      date : new FormControl(''),
      dogName: new FormControl(''),
      orderOfBowls: this._formBuilder.array([]),
      chickenBowl: new FormControl(''),
      nBowlsVisited: new FormControl(''),
      bowlsVisitedOrder: this._formBuilder.array([]),
      timeToChicken: new FormControl(''),
      comments: new FormControl('')
    });

    const orderBowls = form.controls.orderOfBowls as FormArray;
    for(let i=0; i<this.bowls.length; i++) {
      orderBowls.push(this._formBuilder.group({bowl: ''}));
    }
    
    return form;
  }

  onSubmit() : void {
    let data = Object.assign({}, this.dataForm.getRawValue());
    this.dataForm = this.createForm();
    this.isAddingData = false;

    this._dataService.create(data).subscribe(x => console.log(x));
  }

  onCancel() : void {
    this.dataForm = this.createForm();
    this.isAddingData = false;
    this.isloggingIn = false;
    this.password = '';
  }

  loginSubmit() : void {
    if(this.password == this.asdf) this.ASDF = true;
   // this._authService.login(this.email, this.password).subscribe(t => console.log(t));
    this.isloggingIn = false;
    this.password = '';
  }

  login() : void {
    this.isAddingData = false;
    this.isloggingIn = true;
  }

  downloadData() : void {
    var options = { 
      fieldSeparator: ',',
      quoteStrings: '"',
      decimalseparator: '.',
      showLabels: true, 
      showTitle: true,
      title: 'Data Report',
      useBom: true,
      noDownload: false,
      headers: [
        "Date", 
        "Dog", 
        "Initial Order of Bowls",
        "Bowl with Chicken",
        "Number Of Bowls Visited",
        "Oder Bowls Were Visited",
        "Additional Comments"],
      nullToEmptyString: true,
    };

    let dataPoints = [];
    this._dataService.getDatapoints().subscribe(data => {
      for(let dataPoint of data as any) {
        dataPoint.orderOfBowls = JSON.parse(dataPoint.orderOfBowls);
        dataPoint.bowlsVisitedOrder = JSON.parse(dataPoint.bowlsVisitedOrder);


        var tmp = {
          date: new Date(dataPoint.date).toDateString(),
          dog: dataPoint.dogName,
          orderOfBowls: this.bowlsToString(dataPoint.orderOfBowls),
          chickenBowl: dataPoint.chickenBowl,
          nBowlsVisited: dataPoint.nBowlsVisited,
          bowlsVisitedOrder: this.bowlsToString(dataPoint.bowlsVisitedOrder),
          timeToChicken: dataPoint.timeToChicken,
          comments: dataPoint.comments
        };

        dataPoints.push(tmp);
      }

      dataPoints.sort(function(a,b){return new Date(a).getTime() - new Date(b).getTime()});
      new Angular5Csv(dataPoints, "Report", options);
    });
  }

  bowlsToString(arr: any) : string {
    let result = "";

    for(let b of arr) {
      if(b) {
        if(b.bowl) {
          result = result + b.bowl + "-";
        }
      }
    }

    return result;
  }
}
