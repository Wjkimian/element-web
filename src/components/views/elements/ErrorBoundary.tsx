/*
Copyright 2024 New Vector Ltd.
Copyright 2019-2021 The Matrix.org Foundation C.I.C.

SPDX-License-Identifier: AGPL-3.0-only OR GPL-3.0-only OR LicenseRef-Element-Commercial
Please see LICENSE files in the repository root for full details.
*/

import React, { ErrorInfo, ReactNode } from "react";
import { logger } from "matrix-js-sdk/src/logger";

import { _t } from "../../../languageHandler";
import { MatrixClientPeg } from "../../../MatrixClientPeg";
import PlatformPeg from "../../../PlatformPeg";
import AccessibleButton from "./AccessibleButton";

interface Props {
    children: ReactNode;
}

interface IState {
    error?: Error;
}

/**
 * 이 ErrorBoundary 컴포넌트는 자식 컴포넌트 트리에서 발생한 예외를 잡아내어
 * 에러 발생 시 메시지를 표시합니다.
 */
export default class ErrorBoundary extends React.PureComponent<Props, IState> {
    public constructor(props: Props) {
        super(props);
        this.state = {};
    }

    public static getDerivedStateFromError(error: Error): Partial<IState> {
        // 사이드 이펙트가 허용되지 않으므로, 단순히 상태를 업데이트하여 다음 렌더링 시 에러 메시지를 표시합니다.
        return { error };
    }

    public componentDidCatch(error: Error, { componentStack }: ErrorInfo): void {
        // 에러를 콘솔에 로깅합니다.
        logger.error(error);
        logger.error("다음 컴포넌트 렌더링 중 에러가 발생했습니다:", componentStack);
    }

    private onClearCacheAndReload = (): void => {
        if (!PlatformPeg.get()) return;
        MatrixClientPeg.safeGet().stopClient();
        MatrixClientPeg.safeGet()
            .store.deleteAllData()
            .then(() => {
                PlatformPeg.get()?.reload();
            });
    };

    public render(): ReactNode {
        if (this.state.error) {
            // 에러 발생 시 "Ready to go!" 메시지와 버튼을 표시합니다.
            return (
                <div className="mx_ErrorBoundary">
                    <div className="mx_ErrorBoundary_body">
                        <h1>Are You Ready?</h1>
                        <AccessibleButton onClick={this.onClearCacheAndReload} kind="primary">
                            Ready to go!
                        </AccessibleButton>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
