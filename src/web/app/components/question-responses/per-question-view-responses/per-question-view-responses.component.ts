import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { TableComparatorService } from '../../../../services/table-comparator.service';
import {
  FeedbackQuestionDetails,
  FeedbackQuestionType,
  FeedbackSession, FeedbackSessionPublishStatus, FeedbackSessionSubmissionStatus,
  ResponseOutput, ResponseVisibleSetting, SessionVisibleSetting,
} from '../../../../types/api-output';
import { SortBy, SortOrder } from '../../../../types/sort-properties';
import {
  InstructorSessionResultSectionType,
} from '../../../pages-instructor/instructor-session-result-page/instructor-session-result-section-type.enum';

/**
 * Component to display list of responses for one question.
 */
@Component({
  selector: 'tm-per-question-view-responses',
  templateUrl: './per-question-view-responses.component.html',
  styleUrls: ['./per-question-view-responses.component.scss'],
})
export class PerQuestionViewResponsesComponent implements OnInit, OnChanges {

  SortBy: typeof SortBy = SortBy;
  SortOrder: typeof SortOrder = SortOrder;

  @Input() questionId: string = '';
  @Input() questionDetails: FeedbackQuestionDetails = {
    questionType: FeedbackQuestionType.TEXT,
    questionText: '',
  };
  @Input() responses: ResponseOutput[] = [];
  @Input() section: string = '';
  @Input() sectionType: InstructorSessionResultSectionType = InstructorSessionResultSectionType.EITHER;
  @Input() groupByTeam: boolean = true;
  @Input() indicateMissingResponses: boolean = true;
  @Input() showGiver: boolean = true;
  @Input() showRecipient: boolean = true;
  @Input() session: FeedbackSession = {
    courseId: '',
    timeZone: '',
    feedbackSessionName: '',
    instructions: '',
    submissionStartTimestamp: 0,
    submissionEndTimestamp: 0,
    gracePeriod: 0,
    sessionVisibleSetting: SessionVisibleSetting.AT_OPEN,
    responseVisibleSetting: ResponseVisibleSetting.AT_VISIBLE,
    submissionStatus: FeedbackSessionSubmissionStatus.OPEN,
    publishStatus: FeedbackSessionPublishStatus.NOT_PUBLISHED,
    isClosingEmailEnabled: true,
    isPublishedEmailEnabled: true,
    createdAtTimestamp: 0,
  };

  responsesToShow: ResponseOutput[] = [];
  sortBy: SortBy = SortBy.NONE;
  sortOrder: SortOrder = SortOrder.ASC;

  constructor(private tableComparatorService: TableComparatorService) { }

  ngOnInit(): void {
    this.filterResponses();
  }

  ngOnChanges(): void {
    this.filterResponses();
  }

  private filterResponses(): void {
    const responsesToShow: ResponseOutput[] = [];
    for (const response of this.responses) {
      if (this.section) {
        let shouldDisplayBasedOnSection: boolean = true;
        switch (this.sectionType) {
          case InstructorSessionResultSectionType.EITHER:
            shouldDisplayBasedOnSection =
                response.giverSection === this.section || response.recipientSection === this.section;
            break;
          case InstructorSessionResultSectionType.GIVER:
            shouldDisplayBasedOnSection = response.giverSection === this.section;
            break;
          case InstructorSessionResultSectionType.EVALUEE:
            shouldDisplayBasedOnSection = response.recipientSection === this.section;
            break;
          case InstructorSessionResultSectionType.BOTH:
            shouldDisplayBasedOnSection =
                response.giverSection === this.section && response.recipientSection === this.section;
            break;
          default:
        }
        if (!shouldDisplayBasedOnSection) {
          continue;
        }
      }
      responsesToShow.push(response);
    }
    this.responsesToShow = responsesToShow;
  }

  sortResponses(by: SortBy): void {
    if (this.sortBy === by) {
      this.sortOrder = this.sortOrder === SortOrder.ASC ? SortOrder.DESC : SortOrder.ASC;
    } else {
      this.sortBy = by;
      this.sortOrder = SortOrder.ASC;
    }
    this.responsesToShow.sort(this.sortResponsesBy(by, this.sortOrder));
  }

  sortResponsesBy(by: SortBy, order: SortOrder):
    ((a: ResponseOutput, b: ResponseOutput) => number) {
    return ((a: ResponseOutput, b: ResponseOutput): number => {
      let strA: string;
      let strB: string;
      switch (by) {
        case SortBy.GIVER_TEAM:
          strA = a.giverTeam;
          strB = b.giverTeam;
          break;
        case SortBy.GIVER_NAME:
          strA = a.giver;
          strB = b.giver;
          break;
        case SortBy.RECIPIENT_TEAM:
          strA = a.recipientTeam;
          strB = b.recipientTeam;
          break;
        case SortBy.RECIPIENT_NAME:
          strA = a.recipient;
          strB = b.recipient;
          break;
        default:
          strA = '';
          strB = '';
      }
      return this.tableComparatorService.compare(by, order, strA, strB);
    });
  }

}
