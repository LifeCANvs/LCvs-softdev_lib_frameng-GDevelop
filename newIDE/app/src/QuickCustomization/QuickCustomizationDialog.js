// @flow
import * as React from 'react';
import Dialog, { DialogPrimaryButton } from '../UI/Dialog';
import { renderQuickCustomization, useQuickCustomizationState } from '.';
import { Trans } from '@lingui/macro';
import { type ResourceManagementProps } from '../ResourcesList/ResourceSource';
import FlatButton from '../UI/FlatButton';
import { ColumnStackLayout, LineStackLayout } from '../UI/Layout';
import Text from '../UI/Text';
import { type Exporter } from '../ExportAndShare/ShareDialog';
import { useGameAndBuildsManager } from '../Utils/UseGameAndBuildsManager';
import { sendQuickCustomizationProgress } from '../Utils/Analytics/EventSender';
import ScrollView from '../UI/ScrollView';
import PreviewIcon from '../UI/CustomSvgIcons/Preview';
import { Column } from '../UI/Grid';
import Paper from '../UI/Paper';
import PlaySquared from '../UI/CustomSvgIcons/PlaySquared';
import GDevelopThemeContext from '../UI/Theme/GDevelopThemeContext';

type Props = {|
  project: gdProject,
  resourceManagementProps: ResourceManagementProps,
  onLaunchPreview: () => Promise<void>,
  onClose: (?{| tryAnotherGame: boolean |}) => void,
  onlineWebExporter: Exporter,
  onSaveProject: () => Promise<void>,
  isSavingProject: boolean,
  canClose: boolean,
  sourceGameId: string,
|};

export const QuickCustomizationDialog = ({
  project,
  resourceManagementProps,
  onLaunchPreview,
  onClose,
  onlineWebExporter,
  onSaveProject,
  isSavingProject,
  canClose,
  sourceGameId,
}: Props) => {
  const gameAndBuildsManager = useGameAndBuildsManager({
    project,
    copyLeaderboardsAndMultiplayerLobbiesFromGameId: sourceGameId,
  });
  const quickCustomizationState = useQuickCustomizationState({ onClose });
  const gdevelopTheme = React.useContext(GDevelopThemeContext);

  const onContinueQuickCustomization = React.useCallback(
    () => {
      quickCustomizationState.goToPreviousStep();
    },
    [quickCustomizationState]
  );

  const onTryAnotherGame = React.useCallback(
    () => {
      onClose({ tryAnotherGame: true });
    },
    [onClose]
  );

  const { title, content, showPreview } = renderQuickCustomization({
    project,
    gameAndBuildsManager,
    resourceManagementProps,
    onLaunchPreview,
    quickCustomizationState,
    onlineWebExporter,
    onSaveProject,
    isSavingProject,
    onClose,
    onContinueQuickCustomization,
    onTryAnotherGame,
  });

  const name = project.getName();
  React.useEffect(
    () => {
      sendQuickCustomizationProgress({
        stepName: quickCustomizationState.step.name,
        sourceGameId,
        projectName: name,
      });
    },
    [quickCustomizationState.step.name, sourceGameId, name]
  );

  return (
    <Dialog
      open
      title={null}
      maxWidth="md"
      fullHeight
      actions={
        !quickCustomizationState.step.shouldHideNavigationButtons
          ? [
              quickCustomizationState.canGoToPreviousStep ? (
                <FlatButton
                  key="previous"
                  label={<Trans>Back</Trans>}
                  onClick={quickCustomizationState.goToPreviousStep}
                  disabled={
                    !quickCustomizationState.canGoToPreviousStep ||
                    quickCustomizationState.isNavigationDisabled
                  }
                />
              ) : null,
              <DialogPrimaryButton
                key="next"
                label={quickCustomizationState.step.nextLabel}
                primary
                onClick={quickCustomizationState.goToNextStep}
                disabled={quickCustomizationState.isNavigationDisabled}
              />,
            ]
          : undefined
      }
      secondaryActions={[
        quickCustomizationState.step.shouldHideNavigationButtons ||
        !canClose ? null : (
          <FlatButton
            key="close"
            label={<Trans>Close</Trans>}
            primary={false}
            onClick={onClose}
            disabled={quickCustomizationState.isNavigationDisabled}
          />
        ),
      ]}
      flexBody
    >
      <ColumnStackLayout noMargin>
        <ScrollView key={quickCustomizationState.step.name}>
          <ColumnStackLayout noMargin expand>
            <LineStackLayout
              noMargin
              alignItems="center"
              justifyContent="space-between"
            >
              <Text noMargin size={'title'}>
                {title}
              </Text>
            </LineStackLayout>
            {content}
          </ColumnStackLayout>
        </ScrollView>
        {showPreview ? (
          <Column>
            <Paper background="light">
              <Column>
                <LineStackLayout
                  alignItems="center"
                  justifyContent="space-between"
                  expand
                >
                  <LineStackLayout
                    noMargin
                    alignItems="center"
                    justifyContent="center"
                  >
                    <PlaySquared htmlColor={gdevelopTheme.message.valid} />
                    <Text noMargin size="body-small">
                      Preview your game
                    </Text>
                  </LineStackLayout>
                  <FlatButton
                    primary
                    label={<Trans>Preview</Trans>}
                    onClick={onLaunchPreview}
                    leftIcon={<PreviewIcon />}
                  />
                </LineStackLayout>
              </Column>
            </Paper>
          </Column>
        ) : null}
      </ColumnStackLayout>
    </Dialog>
  );
};
