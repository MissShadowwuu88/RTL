import { Component, OnChanges, Input } from '@angular/core';
import { GetInfo } from '../../../shared/models/clModels';
import { CommonService } from '../../../shared/services/common.service';

@Component({
  selector: 'rtl-cln-node-info',
  templateUrl: './node-info.component.html',
  styleUrls: ['./node-info.component.scss']
})
export class CLNNodeInfoComponent implements OnChanges {

  @Input() information: GetInfo;
  @Input() showColorFieldSeparately: boolean;
  public chains: Array<string> = [''];

  constructor(private commonService: CommonService) { }

  ngOnChanges() {
    if (this.information && this.information.chains && this.information.chains.length > 0) {
      this.chains = [''];
      this.information.chains.forEach((chain) => {
        this.chains.push(this.commonService.titleCase(chain.chain) + ' ' + this.commonService.titleCase(chain.network));
      });
    }
  }

}
