<?php

class PrefixRulesetTest extends WP_UnitTestCase {
	public function test_legacy_prefixes_pass_and_foreign_globals_fail() {
		$root  = dirname( __DIR__, 2 );
		$cases = array(
			array( "<?php\n\$lzb_value = 1;\ndo_action( 'lzb/init' );\n", 0, array() ),
			array(
				"<?php\n\$foreign_value = 1;\ndo_action( 'foreign/hook' );\n",
				1,
				array(
					'WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedHooknameFound',
					'WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound',
				),
			),
		);

		foreach ( $cases as $case ) {
			$process = proc_open(
				array(
					PHP_BINARY,
					$root . '/vendor/bin/phpcs',
					'-q',
					'--standard=' . $root . '/phpcs.xml.dist',
					'--sniffs=WordPress.NamingConventions.PrefixAllGlobals',
					'--report=json',
					'--stdin-path=' . $root . '/prefix-fixture.php',
					'-',
				),
				array( array( 'pipe', 'r' ), array( 'pipe', 'w' ), array( 'pipe', 'w' ) ),
				$pipes,
				$root
			);
			fwrite( $pipes[0], $case[0] );
			fclose( $pipes[0] );
			$output = stream_get_contents( $pipes[1] );
			$error  = stream_get_contents( $pipes[2] );
			fclose( $pipes[1] );
			fclose( $pipes[2] );
			$exit_code = proc_close( $process );

			$this->assertSame( $case[1], $exit_code, $output . $error );
			$report = json_decode( $output, true );
			$this->assertIsArray( $report, $output . $error );
			$sources = array();
			foreach ( $report['files'] as $file ) {
				foreach ( $file['messages'] as $message ) {
					$sources[] = $message['source'];
				}
			}
			sort( $sources );
			$this->assertSame( $case[2], $sources );
		}
	}
}
