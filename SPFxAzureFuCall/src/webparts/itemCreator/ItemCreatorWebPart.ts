import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import { Providers, SharePointProvider } from '@microsoft/mgt-spfx';
import { IPropertyPaneConfiguration, PropertyPaneTextField } from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { IReadonlyTheme } from '@microsoft/sp-component-base';
import * as strings from 'ItemCreatorWebPartStrings';
import ItemCreator from './components/ItemCreator';
import { IItemCreatorProps } from './components/IItemCreatorProps';


export interface IItemCreatorWebPartProps {
  ListTitle: string;
  ClientID: string;
  apiUrl: string;
}

export default class ItemCreatorWebPart extends BaseClientSideWebPart<IItemCreatorWebPartProps> {

  private _isDarkTheme: boolean = false;
  private _environmentMessage: string = '';

  public render(): void {
    const element: React.ReactElement<IItemCreatorProps> = React.createElement(
      ItemCreator,
      {
        context: this.context,
        hasTeamsContext: !!this.context.sdks.microsoftTeams,
        ListTitle: this.properties.ListTitle,
        ClientID: this.properties.ClientID,
        apiUrl: this.properties.apiUrl,
      }
    );

    ReactDom.render(element, this.domElement);
  }

  protected async onInit(): Promise<void> {
    this._environmentMessage = this._getEnvironmentMessage();
    if (!Providers.globalProvider) {
      Providers.globalProvider = new SharePointProvider(this.context);
    }
    await super.onInit();
  }

  private _getEnvironmentMessage(): string {
    if (!!this.context.sdks.microsoftTeams) { // running in Teams
      return this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentTeams : strings.AppTeamsTabEnvironment;
    }
    return this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentSharePoint : strings.AppSharePointEnvironment;
  }

  protected onThemeChanged(currentTheme: IReadonlyTheme | undefined): void {
    if (!currentTheme) {
      return;
    }

    this._isDarkTheme = !!currentTheme.isInverted;
    const {
      semanticColors
    } = currentTheme;

    if (semanticColors) {
      this.domElement.style.setProperty('--bodyText', semanticColors.bodyText || null);
      this.domElement.style.setProperty('--link', semanticColors.link || null);
      this.domElement.style.setProperty('--linkHovered', semanticColors.linkHovered || null);
    }

  }


  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('ListTitle', { label: strings.ListTitleFieldLabel }),
                PropertyPaneTextField('ClientID', { label: strings.ClientIDFieldLabel }),
                PropertyPaneTextField('apiUrl', { label: strings.apiUrlFieldLabel })
              ]
            }
          ]
        }
      ]
    };
  }
}
