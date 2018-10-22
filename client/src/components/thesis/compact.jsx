// @flow

import 'moment/locale/de';
import React, { Component } from 'react';
import autoBind from 'react-autobind';

import '../../index.css';
import PositionChart from '../positionChart/';
import ErrorHandler from '../../utils/errorHandler';

import type {
  ErrorType,
  MergedPartyDataType,
  ElectionType,
  PositionType,
  RouteProps,
  ThesisType
} from '../../types/';

import './Thesis.css';

type State = {
  ratioPro: number,
  ratioContra: number,
  loading: boolean,
  parties: Array<MergedPartyDataType>,
  proPositions: Array<PositionType>,
  neutralPositions: Array<PositionType>,
  contraPositions: Array<PositionType>,
  voterOpinion: -1 | 0 | 1
};

type Props = RouteProps & ThesisType & {
  election?: ElectionType,
  linkElection?: boolean,
  showHints?: boolean,
  quizMode?: boolean
};

export default class CompactThesis extends Component<Props, State> {
  handleError: ErrorType => any;

  constructor(props: Props) {
    super(props);
    autoBind(this);
    this.state = {
      loading: false,
      parties: [],
      proPositions: [],
      neutralPositions: [],
      contraPositions: [],
      voterOpinion: 0,
      ratioPro: 0.5,
      ratioContra: 0.5
    }

    this.handleError = ErrorHandler.bind(this);
  }

  componentWillMount() {
    this.mergePartyData();
  }

  componentWillReceiveProps(nextProps: Props) {
    this.setState({
      tags: nextProps.tags
    });

    if (Object.is(nextProps.election.results, this.props.election.results) === false) {
      this.mergePartyData();
    }
  }

  mergePartyData() {
    // Merge party positions with election results
    const res = this.props.election.results;
    const sortPositions = (a, b) => {
      if (res != null) {
        // Sort last if vote count unknown
        if (res[a.party] == null) return 1;
        if (res[b.party] == null) return -1;

        if (res[a.party]["votes"] !== res[b.party]["votes"]) {
          return res[a.party]["votes"] > res[b.party]["votes"] ? -1 : 1;
        }
      }

      // Sort by name otherwise
      return a.party > b.party ? 1 : -1;
    }

    const parties = Object.keys(res)
      .map(party => {
        const linked_position = res[party]["linked_position"] || party;
        const rv = Object.assign({},
          res[party],
          this.props.positions.filter(pos =>
              pos.party === linked_position || pos.party === party
            ).shift() || { value: 'missing' },
          { party }
        );
        return rv;
      })

    let proPositions = parties
      .filter(p => p.value === 1)
      .sort(sortPositions)

    let neutralPositions = parties
      .filter(p => p.value === 0)
      .sort(sortPositions)

    let contraPositions = parties
      .filter(p => p.value === -1)
      .sort(sortPositions)

    this.setState({parties, proPositions, neutralPositions, contraPositions},
      this.updateVoterOpinion);
  }

  updateVoterOpinion() {
    const countVotes = (prev, cur) =>
      this.props.election.results[cur["party"]] == null
        ? prev
        : prev + this.props.election.results[cur["party"]]["pct"];

    let voterOpinion;

    const ratioPro = this.state.proPositions.reduce(countVotes, 0.0);
    const ratioContra = this.state.contraPositions.reduce(countVotes, 0.0);

    if (ratioPro > 50.0) {
      voterOpinion = 1;
    } else if (ratioContra < 50.0) {
      voterOpinion = 0;
    } else {
      voterOpinion = -1;
    }

    this.setState({voterOpinion, ratioPro, ratioContra});
  }

  render() {
    return <PositionChart
      parties={this.state.parties}
      toggleOpen={() => {}}
      compact={true} />
  }
}
