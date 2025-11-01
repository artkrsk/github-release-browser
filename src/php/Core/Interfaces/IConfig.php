<?php

namespace Arts\GH\ReleaseBrowser\Core\Interfaces;

interface IConfig {
	public function get( string $key, $default = null);
}