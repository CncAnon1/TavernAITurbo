## 🚨 중요 -- 보안

TavernAI의 새로운 버전은 악의적인 캐릭터 카드를 로딩할 때 심각한 취약점에 노출되어 있습니다 (https://github.com/TavernAI/TavernAI/issues/93). 이 포크는 해당 특정 익스플로잇에는 취약하지 않지만, TavernAI의 코드는 난잡하여 미발견된 취약점이 있을 가능성이 항상 있습니다.

안전을 위해, TavernAI 서버를 인터넷에 노출시키지 않는 것을 강력히 권장합니다. 이 포크는 기본적으로 그렇게 설정되어 있지만, [config.conf](config.conf) 에서 `whitelistMode = true` 를 확인하여 확인할 수 있습니다.

`whitelistMode = false` 로 설정하지 마십시오. 시스템이 다른 방식으로 격리되어 있다는 것을 완전히 확신하는 경우에만 그렇게 하십시오.

대신 https://github.com/luminai-companion/agn-ai 를 사용하는 것을 고려해보십시오. 설정이 좀 더 복잡하지만, 더욱 견고하고 안정적인 소프트웨어입니다.
