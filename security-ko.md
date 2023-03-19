## 🚨중요 -- 보안
TavernAI의 일부 최신 버전(1.3.0, 1.3.1)은 악성 캐릭터 카드를 로드할 때 심각한 취약점에 노출되어 있습니다(https://github.com/TavernAI/TavernAI/issues/93). 이 포크(1.2.8)는 이 특정 취약점에는 영향을 받지 않지만, TavernAI의 코드는 매우 복잡하며 다른 발견되지 않은 취약점이 있을 가능성이 항상 있습니다. 신뢰할 수 없는 소스로부터 캐릭터 카드를 로드할 때 주의를 기울이고 내용을 https://zoltanai.github.io/character-editor/를 사용하여 확인하십시오.

안전을 위해 어떠한 경우에도 TavernAI 서버에 대한 공개 접근을 허용하지 않는 것이 좋습니다. 이 포크는 기본적으로 이러한 방식으로 구성되어 있지만, [config.conf](config.conf)에서 `whitelistMode = true`를 확인하여 확인할 수 있습니다.

절대로 시스템이 다른 방식으로 격리되어 있다고 확신하지 않는 한 `whitelistMode = false`로 설정하지 마십시오.

대신 더 복잡하게 설정할 수는 있지만 더 견고한 소프트웨어인 https://github.com/luminai-companion/agn-ai 사용을 고려해보십시오.
