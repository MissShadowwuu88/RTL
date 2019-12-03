import { Component, OnInit, OnDestroy } from '@angular/core';
import { map } from 'rxjs/operators';
import { Breakpoints, BreakpointObserver } from '@angular/cdk/layout';
import { Subject, of } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { Actions } from '@ngrx/effects';
import { faSmile } from '@fortawesome/free-regular-svg-icons';

import { LoggerService } from '../../shared/services/logger.service';
import { ChannelsStatus, GetInfo, NetworkInfo, Fees, Peer } from '../../shared/models/lndModels';
import { SelNodeChild } from '../../shared/models/RTLconfig';

import * as RTLActions from '../../store/rtl.actions';
import * as fromRTLReducer from '../../store/rtl.reducers';

@Component({
  selector: 'rtl-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  public faSmile = faSmile;
  public selNode: SelNodeChild = {};
  public fees: Fees;
  public information: GetInfo = {};
  public balances = { onchain: -1, lightning: -1 };
  public remainder = 0;
  public totalPeers = -1;
  public totalBalance = 0;
  public channelBalance = 0;
  public BTCtotalBalance = 0;
  public BTCchannelBalance = 0;
  public networkInfo: NetworkInfo = {};
  public flgLoading: Array<Boolean | 'error'> = [true, true, true, true, true, true, true, true]; // 0: Info, 1: Fee, 2: Wallet, 3: Channel, 4: Network
  private unsub: Array<Subject<void>> = [new Subject(), new Subject(), new Subject()];
  public channels: any;
  public position = 'below';
  public activeChannels = 0;
  public inactiveChannels = 0;
  public pendingChannels = 0;
  public channelsStatus: ChannelsStatus = {};
  public peers: Peer[] = [];
  barPadding = 0;
  maxBalanceValue = 0;
  totalBalances = [{'name': 'Local Balance', 'value': 0}, {'name': 'Remote Balance', 'value': 0}];
  flgTotalCalculated = false;
  view = [];
  yAxisLabel = 'Balance';
  colorScheme = {domain: ['#FFFFFF']};
  cards = this.breakpointObserver.observe(Breakpoints.Handset).pipe(
    map(({ matches }) => {
      if (matches) {
        return [
          { id: 'node', title: 'Node Details', cols: 10, rows: 1 },
          { id: 'balance', title: 'Balances', cols: 10, rows: 1 },
          { id: 'fee', title: 'Routing Fee Earned', cols: 10, rows: 1 },
          { id: 'status', title: 'Channel Status', cols: 10, rows: 1 },
          { id: 'capacity', title: 'Channel Capacity', cols: 10, rows: 1 }
        ];
      }

      return [
        { id: 'node', title: 'Node Details', cols: 3, rows: 1 },
        { id: 'balance', title: 'Balances', cols: 3, rows: 1 },
        { id: 'capacity', title: 'Channel Capacity', cols: 4, rows: 2 },
        { id: 'fee', title: 'Routing Fee Earned', cols: 3, rows: 1 },
        { id: 'status', title: 'Channel Status', cols: 3, rows: 1 }
      ];
    })
  );    


  constructor(private logger: LoggerService, private store: Store<fromRTLReducer.RTLState>, private actions$: Actions, private breakpointObserver: BreakpointObserver) {
    switch (true) {
      case (window.innerWidth <= 730):
        this.view = [250, 352];
        break;
      case (window.innerWidth > 415 && window.innerWidth <= 730):
        this.view = [280, 352];
        break;
      case (window.innerWidth > 730 && window.innerWidth <= 1024):
        this.view = [300, 352];
        break;
      case (window.innerWidth > 1024 && window.innerWidth <= 1280):
        this.view = [350, 352];
        break;
      default:
        this.view = [300, 352];
        break;
    }
    Object.assign(this, this.totalBalances);
  }

  ngOnInit() {
    this.actions$.pipe(takeUntil(this.unsub[0]),
    filter(action => action.type === RTLActions.SET_SELECTED_NODE))
    .subscribe((data) => {
      this.flgTotalCalculated = false;
    });
    this.store.select('lnd')
    .pipe(takeUntil(this.unsub[1]))
    .subscribe((rtlStore) => {
      rtlStore.effectErrorsLnd.forEach(effectsErr => {
        if (effectsErr.action === 'FetchInfo') {
          this.flgLoading[0] = 'error';
        }
        if (effectsErr.action === 'FetchFees') {
          this.flgLoading[1] = 'error';
        }
        if (effectsErr.action === 'FetchBalance/blockchain') {
          this.flgLoading[2] = 'error';
        }
        if (effectsErr.action === 'FetchBalance/channels') {
          this.flgLoading[3] = 'error';
        }
        if (effectsErr.action === 'FetchNetwork') {
          this.flgLoading[4] = 'error';
        }
        if (effectsErr.action === 'FetchChannels/all') {
          this.flgLoading[5] = 'error';
          this.flgLoading[6] = 'error';
        }
      });
      this.selNode = rtlStore.nodeSettings;
      this.information = rtlStore.information;
      if (this.flgLoading[0] !== 'error') {
        this.flgLoading[0] = (undefined !== this.information.identity_pubkey) ? false : true;
      }

      this.fees = rtlStore.fees;
      if (this.flgLoading[1] !== 'error') {
        this.flgLoading[1] = (undefined !== this.fees.day_fee_sum) ? false : true;
      }
      this.balances.onchain = rtlStore.blockchainBalance.total_balance;
      this.totalBalance = rtlStore.blockchainBalance.total_balance;
      this.BTCtotalBalance = rtlStore.blockchainBalance.btc_total_balance;
      if (this.flgLoading[2] !== 'error') {
        this.flgLoading[2] = (this.totalBalance >= 0) ? false : true;
      }

      this.channelBalance = rtlStore.channelBalance.balance;
      this.BTCchannelBalance = rtlStore.channelBalance.btc_balance;
      if (this.flgLoading[3] !== 'error') {
        this.flgLoading[3] = (this.channelBalance >= 0) ? false : true;
      }

      this.networkInfo = rtlStore.networkInfo;
      if (this.flgLoading[4] !== 'error') {
        this.flgLoading[4] = (undefined !== this.networkInfo.num_nodes) ? false : true;
      }

      if (rtlStore.totalLocalBalance >= 0 && rtlStore.totalRemoteBalance >= 0) {
        this.balances.lightning = rtlStore.totalLocalBalance;
        this.totalBalances = [{'name': 'Local Balance', 'value': rtlStore.totalLocalBalance}, {'name': 'Remote Balance', 'value': rtlStore.totalRemoteBalance}];
        this.maxBalanceValue = (rtlStore.totalLocalBalance > rtlStore.totalRemoteBalance) ? rtlStore.totalLocalBalance : rtlStore.totalRemoteBalance;
        this.flgTotalCalculated = true;
        if (this.flgLoading[5] !== 'error') {
          this.flgLoading[5] = false;
        }
      }
      this.activeChannels =  rtlStore.numberOfActiveChannels;
      this.inactiveChannels = rtlStore.numberOfInactiveChannels;
      this.pendingChannels = (undefined !== rtlStore.pendingChannels.pending_open_channels) ? rtlStore.pendingChannels.pending_open_channels.length : 0;
      this.pendingChannels = this.pendingChannels + ((undefined !== rtlStore.pendingChannels.waiting_close_channels) ? rtlStore.pendingChannels.waiting_close_channels.length : 0);
      this.pendingChannels = this.pendingChannels + ((undefined !== rtlStore.pendingChannels.pending_closing_channels) ? rtlStore.pendingChannels.pending_closing_channels.length : 0);
      this.pendingChannels = this.pendingChannels + ((undefined !== rtlStore.pendingChannels.pending_force_closing_channels) ? rtlStore.pendingChannels.pending_force_closing_channels.length : 0);
console.warn(rtlStore.pendingChannels.total_limbo_balance);
      this.channelsStatus = {
        active: { channels: rtlStore.numberOfActiveChannels, capacity: rtlStore.totalCapacityActive },
        inactive: { channels: rtlStore.numberOfInactiveChannels, capacity: rtlStore.totalCapacityInactive },
        pending: { channels: this.pendingChannels, capacity: rtlStore.pendingChannels.total_limbo_balance },
        closed: { channels: (rtlStore.closedChannels && rtlStore.closedChannels.length) ? rtlStore.closedChannels.length : 0, capacity: 0 }
      };
      if (rtlStore.totalLocalBalance >= 0 && rtlStore.totalRemoteBalance >= 0 && this.flgLoading[6] !== 'error') {
        this.flgLoading[6] = false;
      }

      this.totalPeers = (rtlStore.peers !== null) ? rtlStore.peers.length : 0;

      this.logger.info(rtlStore);
    });
  }

  initializeCards() {
    this.breakpointObserver.observe(Breakpoints.Handset).pipe(
      map(({ matches }) => {
        if (matches) {
          return [
            { title: 'Card 1', cols: 1, rows: 1 },
            { title: 'Card 2', cols: 1, rows: 1 },
            { title: 'Card 3', cols: 1, rows: 1 },
            { title: 'Card 4', cols: 1, rows: 1 },
            { title: 'Card 4', cols: 1, rows: 1 }
          ];
        }
  
        return [
          { title: 'Card 1', cols: 3, rows: 1 },
          { title: 'Card 2', cols: 3, rows: 1 },
          { title: 'Card 3', cols: 4, rows: 2 },
          { title: 'Card 4', cols: 3, rows: 1 },
          { title: 'Card 4', cols: 3, rows: 1 }
        ];
      })
    );    
  }
  
  ngOnDestroy() {
    this.unsub.forEach(completeSub => {
      completeSub.next();
      completeSub.complete();
    });
  }

}
