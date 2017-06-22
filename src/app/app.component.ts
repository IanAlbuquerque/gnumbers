import { Component } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import { environment } from 'environments/environment';
import 'rxjs/add/operator/toPromise';

interface CustomSearchResponseBody {
  searchInformation: { totalResults: number };
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  public search_txt: string = '';
  public results: {txt: string, num: number}[] = [];

  public x_min: number = 0;
  public x_max: number = 5;
  public x_step: number = 1;

  public lineChartData:Array<any> = [
    {data: [], label: '# of Results'}
  ];
  public lineChartLabels:Array<any> = [];
  public lineChartOptions:any = {
    responsive: true,
    scales: {
      yAxes: [
        {
          ticks: {
            beginAtZero: true
          }
        }
      ]
    }
  };
  public lineChartColors:Array<any> = [
    { // grey
      backgroundColor: 'rgba(148,159,177,0.2)',
      borderColor: 'rgba(148,159,177,1)',
      pointBackgroundColor: 'rgba(148,159,177,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(148,159,177,0.8)'
    }
  ];
  public lineChartLegend:boolean = true;
  public lineChartType:string = 'line';


  public constructor(private http: Http)
  {
  }

  pause(milliseconds) {
    var dt = new Date().getTime();
    while ((new Date()).getTime() - dt <= milliseconds) { /* Do nothing */ }
  }


  private getHeaders(): Headers {
    // I included these headers because otherwise FireFox
    // will request text/html instead of application/json
    let headers = new Headers();
    headers.append('Accept', 'application/json');
    return headers;
  }

  public numResults(txt: string): Promise<number>
  {
    console.log("SEARCHING ",txt);
    let url: string = `${environment.google_api}?key=${environment.google_search_api_key}&cx=${environment.google_cse_id}&q=${encodeURI(txt)}`;
    console.log("SEARCHING URL: ",url);
    return this.http
      .get(url, {headers: this.getHeaders()} )
      .toPromise()
      .then(response => {
        console.log(response);
        return Promise.resolve(response.json() as CustomSearchResponseBody);
      })
      .then(results => {
        console.log("RESULTS ",results);
        return Promise.resolve(results.searchInformation.totalResults);
      })
  }

  public search(): void
  {
    this.results = [];
    this.lineChartData[0].data = [];
    this.lineChartLabels = [];
    let x:number = this.x_min;
    let txt = this.search_txt.replace(/<x>/g,x.toString());
    let index = 0;

    while(x <= this.x_max) {
      let current_txt: string = txt.slice();
      let current_x: number = x;
      let current_index: number = index;

      this.lineChartLabels.push(current_x.toString());
      this.lineChartData[0].data.push(0);

      this.numResults(txt)
      .then(num_results => {
        this.results.push({txt: current_txt, num: num_results});

        this.lineChartData[0].data[current_index] = num_results;
        this.lineChartData[0].data = this.lineChartData[0].data.slice();
        this.lineChartData = this.lineChartData.slice();

        console.log(this.lineChartData);
        console.log(this.lineChartLabels);
      })
      .catch(err => {
        this.results.push({txt: current_txt, num: -1});
      })

      x = x + this.x_step;
      txt = this.search_txt.replace(/<x>/g,x.toString());
      index += 1;
    }
    this.lineChartLabels = this.lineChartLabels.slice();
  }
}
