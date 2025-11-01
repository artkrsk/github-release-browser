<?php

namespace Arts\GH\ReleaseBrowser\Core\Interfaces;

interface IHttpClient {
	public function get( string $url, array $headers = array(), array $options = array());
}
